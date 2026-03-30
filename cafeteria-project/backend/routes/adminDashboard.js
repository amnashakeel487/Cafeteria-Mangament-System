const express = require('express');
const supabase = require('../database');
const router = express.Router();

router.get('/stats', async (req, res) => {
    try {
        const stats = {
            totalStudents: 0,
            totalCafeterias: 0,
            totalOrders: 0,
            totalRevenue: 0,
            newestStudents: [],
            topCafeteria: null,
            cafeteriaLoads: []
        };

        const [{ error: err1, count: totalStudents }, { error: err2, count: totalCafeterias }, { data: orders, error: err3 }] = await Promise.all([
            supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student'),
            supabase.from('cafeterias').select('*', { count: 'exact', head: true }),
            supabase.from('orders').select('cafeteria_id, total_amount')
        ]);
        
        if (!err1) stats.totalStudents = totalStudents || 0;
        if (!err2) stats.totalCafeterias = totalCafeterias || 0;
        if (!err3 && orders) {
            stats.totalOrders = orders.length;
            stats.totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
        }

        const { data: newestStudents } = await supabase
            .from('users')
            .select('id, name, email, contact')
            .eq('role', 'student')
            .order('id', { ascending: false })
            .limit(3);
            
        if (newestStudents) stats.newestStudents = newestStudents;

        const { data: cafeterias } = await supabase
            .from('cafeterias')
            .select('id, name');

        if (cafeterias && orders) {
            const loadsMap = {};
            cafeterias.forEach(c => {
                loadsMap[c.id] = { id: c.id, name: c.name, order_count: 0 };
            });
            
            orders.forEach(o => {
                if (loadsMap[o.cafeteria_id]) {
                    loadsMap[o.cafeteria_id].order_count++;
                }
            });

            const cafeteriaLoadsArray = Object.values(loadsMap);
            
            // Map keys for the old UI
            stats.cafeteriaLoads = cafeteriaLoadsArray.map(c => ({
                id: c.id,
                name: c.name,
                active_orders: c.order_count
            }));

            // Find top cafeteria
            cafeteriaLoadsArray.sort((a, b) => b.order_count - a.order_count);
            if (cafeteriaLoadsArray.length > 0) {
                stats.topCafeteria = {
                    name: cafeteriaLoadsArray[0].name,
                    order_count: cafeteriaLoadsArray[0].order_count
                };
            }
        }

        res.json(stats);
    } catch (err) {
        console.error("Dashboard Stats Error:", err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
