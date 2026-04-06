const express = require('express');
const supabase = require('../database');
const router = express.Router();

router.get('/:cafeteriaId', async (req, res) => {
    try {
        // Try with deal_items join first
        const { data, error } = await supabase
            .from('deals')
            .select('*, deal_items(*)')
            .eq('cafeteria_id', req.params.cafeteriaId)
            .eq('active', true)
            .order('id', { ascending: false });

        if (error) {
            // Fallback: fetch without deal_items if join fails
            const { data: fallback, error: fallbackErr } = await supabase
                .from('deals')
                .select('*')
                .eq('cafeteria_id', req.params.cafeteriaId)
                .eq('active', true)
                .order('id', { ascending: false });
            if (fallbackErr) return res.status(500).json({ message: 'Database error' });
            return res.json(fallback || []);
        }
        res.json(data || []);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
