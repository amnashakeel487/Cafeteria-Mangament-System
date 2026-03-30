const express = require('express');
const supabase = require('../database');
const router = express.Router();

// GET /api/cafeteria/dashboard/stats
// Returns stats scoped to the logged-in cafeteria via req.cafeteria.id
router.get('/stats', async (req, res) => {
    try {
        const cafeteriaId = req.cafeteria.id;

        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at')
            .eq('cafeteria_id', cafeteriaId);

        if (error) return res.status(500).json({ message: 'Database error' });

        const stats = {
            totalOrders: 0,
            totalRevenue: 0,
            pendingOrders: 0,
            completedOrders: 0,
            todayOrders: 0,
            todayRevenue: 0
        };

        const todayDateString = new Date().toISOString().split('T')[0];

        orders.forEach(order => {
            stats.totalOrders++;
            stats.totalRevenue += order.total_amount;
            
            if (order.status === 'pending') stats.pendingOrders++;
            if (order.status === 'completed') stats.completedOrders++;

            const orderDateString = (order.created_at || '').split('T')[0];
            if (orderDateString === todayDateString) {
                stats.todayOrders++;
                stats.todayRevenue += order.total_amount;
            }
        });

        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/cafeteria/dashboard/orders  — recent orders for this cafeteria
router.get('/orders', async (req, res) => {
    try {
        const cafeteriaId = req.cafeteria.id;
        
        const { data: orders, error } = await supabase
            .from('orders')
            .select('id, total_amount, status, created_at, users!inner(name, email)')
            .eq('cafeteria_id', cafeteriaId)
            .order('id', { ascending: false })
            .limit(20);

        if (error) return res.status(500).json({ message: 'Database error' });

        const formatted = orders.map(o => ({
            id: o.id,
            total_amount: o.total_amount,
            status: o.status,
            date: o.created_at,
            student_name: o.users?.name,
            student_email: o.users?.email
        }));

        res.json(formatted);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
