const express = require('express');
const multer = require('multer');
const path = require('path');
const supabase = require('../database');

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
router.post('/', upload.single('screenshot'), async (req, res) => {
    try {
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
        
        const status = 'pending';
        const payment_status = 'pending';

        const { data: newOrder, error: orderErr } = await supabase
            .from('orders')
            .insert({
                user_id: student_id,
                cafeteria_id,
                total_amount,
                status,
                payment_method,
                payment_screenshot: screenshotUrl,
                payment_status
            })
            .select()
            .single();

        if (orderErr) {
            console.error('Order insert error:', orderErr);
            return res.status(500).json({ message: 'Failed to create order' });
        }
        
        const orderId = newOrder.id;
        
        // Insert order items
        const orderItemsToInsert = parsedItems.map(item => ({
            order_id: orderId,
            item_name: item.name,
            quantity: item.qty,
            price: item.price
        }));

        const { error: itemsErr } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsErr) {
            console.error('Order items insert error:', itemsErr);
            // Optionally delete the order if items fail, or handle appropriately
        }
        
        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET Student Orders
router.get('/', async (req, res) => {
    try {
        const student_id = req.user.id;
        
        const { data: orders, error: ordersErr } = await supabase
            .from('orders')
            .select('*, cafeterias!inner(name, profile_picture)')
            .eq('user_id', student_id)
            .order('created_at', { ascending: false });

        if (ordersErr) {
            console.error('Orders fetch error:', ordersErr);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (!orders || orders.length === 0) return res.json([]);

        // Mangle the Supabase join result to match the old SQLite custom columns
        const formattedOrders = orders.map(o => {
            const row = {
                ...o,
                cafeteria_name: o.cafeterias?.name,
                cafeteria_image: o.cafeterias?.profile_picture
            };
            delete row.cafeterias;
            return row;
        });

        const orderIds = formattedOrders.map(o => o.id);
        
        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        if (itemsErr) {
            console.error('Items fetch error:', itemsErr);
            return res.status(500).json({ message: 'Database error' });
        }
        
        const ordersWithItems = formattedOrders.map(order => ({
            ...order,
            items: items.filter(i => i.order_id === order.id)
        }));
        
        res.json(ordersWithItems);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
