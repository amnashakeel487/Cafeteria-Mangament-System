const express = require('express');
const db = require('../database');
const router = express.Router();

// GET /api/cafeteria/dashboard/stats
// Returns stats scoped to the logged-in cafeteria via req.cafeteria.id
router.get('/stats', (req, res) => {
    const cafeteriaId = req.cafeteria.id;

    const stats = {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        todayOrders: 0,
        todayRevenue: 0
    };

    db.get(`SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM orders WHERE cafeteria_id = ?`,
        [cafeteriaId], (err, row) => {
        if (!err && row) {
            stats.totalOrders = row.count || 0;
            stats.totalRevenue = row.revenue || 0;
        }

        db.get(`SELECT COUNT(*) as count FROM orders WHERE cafeteria_id = ? AND status = 'pending'`,
            [cafeteriaId], (err, row) => {
            if (!err && row) stats.pendingOrders = row.count || 0;

            db.get(`SELECT COUNT(*) as count FROM orders WHERE cafeteria_id = ? AND status = 'completed'`,
                [cafeteriaId], (err, row) => {
                if (!err && row) stats.completedOrders = row.count || 0;

                // Today's stats
                db.get(`SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM orders 
                    WHERE cafeteria_id = ? AND DATE(created_at) = DATE('now')`,
                    [cafeteriaId], (err, row) => {
                    if (!err && row) {
                        stats.todayOrders = row.count || 0;
                        stats.todayRevenue = row.revenue || 0;
                    }
                    res.json(stats);
                });
            });
        });
    });
});

// GET /api/cafeteria/dashboard/orders  — recent orders for this cafeteria
router.get('/orders', (req, res) => {
    const cafeteriaId = req.cafeteria.id;
    const query = `
        SELECT 
            orders.id,
            orders.total_amount,
            orders.status,
            orders.created_at as date,
            users.name as student_name,
            users.email as student_email
        FROM orders
        JOIN users ON orders.user_id = users.id
        WHERE orders.cafeteria_id = ?
        ORDER BY orders.id DESC
        LIMIT 20
    `;
    db.all(query, [cafeteriaId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
