const express = require('express');
const supabase = require('../database');
const router = express.Router();

router.get('/:cafeteriaId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('deals')
            .select('*, deal_items(*)')
            .eq('cafeteria_id', req.params.cafeteriaId)
            .eq('active', true)
            .order('id', { ascending: false });
        if (error) return res.status(500).json({ message: 'Database error' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
