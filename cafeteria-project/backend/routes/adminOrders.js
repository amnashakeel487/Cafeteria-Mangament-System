const express = require('express');
const supabase = require('../database');
const router = express.Router();

// Get all orders (View Only)
router.get('/', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at, users!inner(name, email), cafeterias!inner(name, location)')
            .order('id', { descending: true });

        if (error) return res.status(500).json({ message: "Database error" });

        const mapped = orders.map(o => ({
            id: o.id,
            total_amount: o.total_amount,
            status: o.status,
            date: o.created_at,
            student_name: o.users?.name,
            student_email: o.users?.email,
            cafeteria_name: o.cafeterias?.name,
            cafeteria_location: o.cafeterias?.location
        }));

        res.json(mapped);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
