const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../database');
const router = express.Router();

// Multer for payment screenshot uploads
const screenshotDir = path.join(__dirname, '../../public/screenshots');
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
router.get('/pending', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total_amount, status, payment_method, payment_screenshot, payment_status, created_at, users!inner(name, email, id)')
            .eq('cafeteria_id', req.cafeteria.id)
            .eq('payment_status', 'pending')
            .neq('payment_method', 'cash')
            .order('id', { ascending: false });

        if (error) return res.status(500).json({ message: 'Database error' });
        
        const formatted = orders.map(o => ({
            ...o,
            student_name: o.users?.name,
            student_email: o.users?.email,
            student_id: o.users?.id,
            users: undefined // remove the nested object
        }));
        
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET all orders for this cafeteria with filters + order items
router.get('/', async (req, res) => {
    try {
        const { status, payment_status } = req.query;
        
        let query = supabase
            .from('orders')
            .select('id, total_amount, status, payment_method, payment_screenshot, payment_status, created_at, users!inner(name, email, id)')
            .eq('cafeteria_id', req.cafeteria.id);
            
        if (status) query = query.eq('status', status);
        if (payment_status) query = query.eq('payment_status', payment_status);
        
        query = query.order('id', { ascending: false }).limit(50);
        
        const { data: orders, error } = await query;

        if (error) return res.status(500).json({ message: 'Database error' });
        if (!orders || orders.length === 0) return res.json([]);

        const orderIds = orders.map(o => o.id);
        
        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        const itemsByOrder = {};
        if (items) {
            items.forEach(item => {
                if (!itemsByOrder[item.order_id]) itemsByOrder[item.order_id] = [];
                itemsByOrder[item.order_id].push(item);
            });
        }

        const result = orders.map(o => ({
            ...o,
            student_name: o.users?.name,
            student_email: o.users?.email,
            student_id: o.users?.id,
            users: undefined,
            items: itemsByOrder[o.id] || []
        }));
        
        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT approve or reject payment  
router.put('/:id/payment', async (req, res) => {
    try {
        const { action, reject_reason } = req.body; // action: 'approve' | 'reject'
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({ message: 'Action must be approve or reject' });
        }

        const { data: order, error: orderErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .eq('cafeteria_id', req.cafeteria.id)
            .maybeSingle();

        if (orderErr || !order) return res.status(404).json({ message: 'Order not found' });

        const newPaymentStatus = action === 'approve' ? 'approved' : 'rejected';
        const newStatus = action === 'approve' ? 'processing' : 'cancelled';

        const { error: updateErr } = await supabase
            .from('orders')
            .update({ payment_status: newPaymentStatus, status: newStatus })
            .eq('id', order.id);

        if (updateErr) return res.status(500).json({ message: 'Database error' });
        
        res.json({
            message: action === 'approve' ? 'Payment approved. Order moved to processing.' : 'Payment rejected. Order cancelled.',
            payment_status: newPaymentStatus,
            status: newStatus
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update order status (for kitchen workflow)
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const allowed = ['pending', 'processing', 'completed', 'cancelled'];
        if (!allowed.includes(status)) return res.status(400).json({ message: 'Invalid status' });

        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', req.params.id)
            .eq('cafeteria_id', req.cafeteria.id);

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Order status updated.', status });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create manual order (for walk-in customers)
router.post('/manual', async (req, res) => {
    try {
        const { items, total_amount } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ message: 'No items provided' });

        // 1. Find or create Walk-in user
        let { data: walkInUser, error: findErr } = await supabase
            .from('users')
            .select('id')
            .eq('email', 'walkin@cafeteria.local')
            .maybeSingle();
            
        if (!walkInUser) {
            const { data: newUser, error: createErr } = await supabase
                .from('users')
                .insert({
                    name: 'Walk-in Customer',
                    email: 'walkin@cafeteria.local',
                    password: 'none',
                    role: 'student'
                })
                .select()
                .single();
                
            if (createErr) return res.status(500).json({ message: 'Failed to create generic user' });
            walkInUser = newUser;
        }

        const { data: newOrder, error: orderErr } = await supabase
            .from('orders')
            .insert({
                user_id: walkInUser.id,
                cafeteria_id: req.cafeteria.id,
                total_amount: total_amount,
                status: 'processing',
                payment_method: 'cash',
                payment_status: 'approved'
            })
            .select()
            .single();

        if (orderErr) return res.status(500).json({ message: 'Error creating order' });
        
        const orderId = newOrder.id;
        const toInsertItems = items.map(i => ({
            order_id: orderId,
            item_name: i.name,
            quantity: i.quantity,
            price: i.price
        }));

        const { error: itemsErr } = await supabase
            .from('order_items')
            .insert(toInsertItems);

        if (itemsErr) return res.status(500).json({ message: 'Error adding items' });
        
        res.status(201).json({ message: 'Manual order created', orderId });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
