const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database');

const router = express.Router();

// Setup Multer for Screenshots
const storage = multer.diskStorage({
    destination: './uploads/screenshots/',
    filename: (req, file, cb) => {
        cb(null, `screenshot-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({ 
    storage,
    limits: { fileSize: 5000000 }, 
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error('Images Only!'));
    }
});

// Create Order endpoint
router.post('/', upload.single('screenshot'), (req, res) => {
    const { cafeteria_id, total_amount, payment_method, items } = req.body;
    const student_id = req.user.id; // from studentAuth middleware
    
    if (!cafeteria_id || !total_amount || !items || !payment_method) {
        return res.status(400).json({ message: 'Missing order details' });
    }

    let parsedItems;
    try {
        parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
    } catch (e) {
        return res.status(400).json({ message: 'Invalid items format' });
    }

    const screenshotUrl = req.file ? `/uploads/screenshots/${req.file.filename}` : null;
    
    // Default status
    const status = 'pending';
    const payment_status = 'pending';

    db.run(
        `INSERT INTO orders (user_id, cafeteria_id, total_amount, status, payment_method, payment_screenshot, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [student_id, cafeteria_id, total_amount, status, payment_method, screenshotUrl, payment_status],
        function(err) {
            if (err) return res.status(500).json({ message: 'Failed to create order' });
            
            const orderId = this.lastID;
            
            // Insert order items
            const insertItem = db.prepare(`INSERT INTO order_items (order_id, item_name, quantity, price) VALUES (?, ?, ?, ?)`);
            parsedItems.forEach(item => {
                insertItem.run(orderId, item.name, item.qty, item.price);
            });
            insertItem.finalize();
            
            res.status(201).json({ message: 'Order created successfully', orderId });
        }
    );
});

// GET Student Orders
router.get('/', (req, res) => {
    const student_id = req.user.id;
    
    db.all(`
        SELECT o.*, c.name as cafeteria_name, c.profile_picture as cafeteria_image
        FROM orders o
        JOIN cafeterias c ON o.cafeteria_id = c.id
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC
    `, [student_id], (err, orders) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        
        if (orders.length === 0) return res.json([]);

        // Fetch items for all orders
        const orderIds = orders.map(o => o.id);
        const placeholders = orderIds.map(() => '?').join(',');
        
        db.all(`SELECT * FROM order_items WHERE order_id IN (${placeholders})`, orderIds, (err, items) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            
            const ordersWithItems = orders.map(order => ({
                ...order,
                items: items.filter(i => i.order_id === order.id)
            }));
            
            res.json(ordersWithItems);
        });
    });
});

module.exports = router;
