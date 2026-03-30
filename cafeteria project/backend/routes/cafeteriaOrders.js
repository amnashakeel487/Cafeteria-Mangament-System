const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const router = express.Router();

// Multer for payment screenshot uploads
const screenshotDir = path.join(__dirname, '../../frontend/public/screenshots');
if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, screenshotDir),
    filename: (req, file, cb) => {
        cb(null, `pay_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
            ? cb(null, true) : cb(new Error('Only images allowed'));
    }
});

// ──────────────────────────────────────────────
// CAFETERIA STAFF ENDPOINTS (require cafeteriaAuth middleware)
// ──────────────────────────────────────────────

// GET orders with pending payment verification for this cafeteria
router.get('/pending', (req, res) => {
    db.all(`
        SELECT o.id, o.total_amount, o.status, o.payment_method, o.payment_screenshot,
               o.payment_status, o.created_at,
               u.name as student_name, u.email as student_email, u.id as student_id
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.cafeteria_id = ? AND o.payment_status = 'pending'
          AND o.payment_method != 'cash'
        ORDER BY o.id DESC
    `, [req.cafeteria.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// GET all orders for this cafeteria with filters + order items
router.get('/', (req, res) => {
    const { status, payment_status } = req.query;
    let query = `
        SELECT o.id, o.total_amount, o.status, o.payment_method, o.payment_screenshot,
               o.payment_status, o.created_at,
               u.name as student_name, u.email as student_email, u.id as student_id
        FROM orders o
        JOIN users u ON o.user_id = u.id
        WHERE o.cafeteria_id = ?
    `;
    const params = [req.cafeteria.id];
    if (status) { query += ` AND o.status = ?`; params.push(status); }
    if (payment_status) { query += ` AND o.payment_status = ?`; params.push(payment_status); }
    query += ` ORDER BY o.id DESC LIMIT 50`;

    db.all(query, params, (err, orders) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!orders.length) return res.json([]);

        // Attach order items to each order
        const orderIds = orders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');
        db.all(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`,
            orderIds, (err, items) => {
            if (err) items = [];
            const grouped = {};
            (items || []).forEach(item => {
                if (!grouped[item.order_id]) grouped[item.order_id] = [];
                grouped[item.order_id].push(item);
            });
            const result = orders.map(o => ({ ...o, items: grouped[o.id] || [] }));
            res.json(result);
        });
    });
});

// PUT approve or reject payment  
router.put('/:id/payment', (req, res) => {
    const { action, reject_reason } = req.body; // action: 'approve' | 'reject'
    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ message: 'Action must be approve or reject' });
    }

    db.get(`SELECT * FROM orders WHERE id = ? AND cafeteria_id = ?`,
        [req.params.id, req.cafeteria.id], (err, order) => {
        if (err || !order) return res.status(404).json({ message: 'Order not found' });

        const newPaymentStatus = action === 'approve' ? 'approved' : 'rejected';
        // On approval, move order to processing; on rejection, keep as pending or cancelled
        const newStatus = action === 'approve' ? 'processing' : 'cancelled';

        db.run(`UPDATE orders SET payment_status = ?, status = ? WHERE id = ?`,
            [newPaymentStatus, newStatus, order.id], (err) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({
                message: action === 'approve' ? 'Payment approved. Order moved to processing.' : 'Payment rejected. Order cancelled.',
                payment_status: newPaymentStatus,
                status: newStatus
            });
        });
    });
});

// PUT update order status (for kitchen workflow)
router.put('/:id/status', (req, res) => {
    const { status } = req.body;
    const allowed = ['pending', 'processing', 'completed', 'cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

    db.run(`UPDATE orders SET status = ? WHERE id = ? AND cafeteria_id = ?`,
        [status, req.params.id, req.cafeteria.id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Order status updated.', status });
    });
});

// POST create manual order (for walk-in customers)
router.post('/manual', (req, res) => {
    const { items, total_amount } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items provided' });

    // 1. Find or create Walk-in user
    db.get(`SELECT id FROM users WHERE email = 'walkin@cafeteria.local'`, (err, walkInUser) => {
        if (err) return res.status(500).json({ message: 'Database error: ' + err.message });

        const createOrder = (userId) => {
            db.run(`INSERT INTO orders (user_id, cafeteria_id, total_amount, status, payment_method, payment_status)
                    VALUES (?, ?, ?, 'processing', 'cash', 'approved')`,
                [userId, req.cafeteria.id, total_amount], function(err) {
                if (err) return res.status(500).json({ message: 'Error creating order: ' + err.message });
                
                const orderId = this.lastID;
                const placeholders = items.map(() => '(?, ?, ?, ?)').join(',');
                const values = items.flatMap(i => [orderId, i.name, i.quantity, i.price]);

                db.run(`INSERT INTO order_items (order_id, item_name, quantity, price) VALUES ${placeholders}`, values, (err) => {
                    if (err) return res.status(500).json({ message: 'Error adding items: ' + err.message });
                    res.status(201).json({ message: 'Manual order created', orderId });
                });
            });
        };

        if (walkInUser) return createOrder(walkInUser.id);
        
        // Create user
        db.run(`INSERT INTO users (name, email, password, role) VALUES ('Walk-in Customer', 'walkin@cafeteria.local', 'none', 'student')`, function(err) {
            if (err) return res.status(500).json({ message: 'Failed to create generic user: ' + err.message });
            createOrder(this.lastID);
        });
    });
});

module.exports = router;
