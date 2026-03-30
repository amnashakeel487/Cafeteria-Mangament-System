const express = require('express');
const db = require('../database');
const router = express.Router();

// Get all orders (View Only)
router.get('/', (req, res) => {
    const query = `
        SELECT 
            orders.id,
            orders.total_amount,
            orders.status,
            orders.created_at as date,
            users.name as student_name,
            users.email as student_email,
            cafeterias.name as cafeteria_name,
            cafeterias.location as cafeteria_location
        FROM orders
        JOIN users ON orders.user_id = users.id
        JOIN cafeterias ON orders.cafeteria_id = cafeterias.id
        ORDER BY orders.id DESC
    `;
    
    db.all(query, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
});

module.exports = router;
