const express = require('express');
const db = require('../database');
const router = express.Router();

router.get('/stats', (req, res) => {
    const stats = {
        totalStudents: 0,
        totalCafeterias: 0,
        totalOrders: 0,
        totalRevenue: 0,
        newestStudents: [],
        topCafeteria: null,
        cafeteriaLoads: []
    };

    db.get(`SELECT COUNT(*) as count FROM users WHERE role = 'student'`, (err, row) => {
        if (!err && row) stats.totalStudents = row.count;

        db.get(`SELECT COUNT(*) as count FROM cafeterias`, (err, row) => {
            if (!err && row) stats.totalCafeterias = row.count;

            db.get(`SELECT COUNT(*) as count, SUM(total_amount) as revenue FROM orders`, (err, row) => {
                if (!err && row) {
                    stats.totalOrders = row.count;
                    stats.totalRevenue = row.revenue || 0;
                }

                db.all(`SELECT id, name, email, contact FROM users WHERE role = 'student' ORDER BY id DESC LIMIT 3`, (err, rows) => {
                    if (!err && rows) stats.newestStudents = rows;

                    db.get(`SELECT c.name, COUNT(o.id) as order_count FROM cafeterias c LEFT JOIN orders o ON c.id = o.cafeteria_id GROUP BY c.id ORDER BY order_count DESC LIMIT 1`, (err, row) => {
                        if (!err && row) stats.topCafeteria = row;

                        db.all(`SELECT c.id, c.name, COUNT(o.id) as active_orders FROM cafeterias c LEFT JOIN orders o ON c.id = o.cafeteria_id GROUP BY c.id`, (err, loads) => {
                             if (!err && loads) stats.cafeteriaLoads = loads;
                             res.json(stats);
                        });
                    });
                });
            });
        });
    });
});

module.exports = router;
