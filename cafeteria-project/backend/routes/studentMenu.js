const express = require('express');
const supabase = require('../database');

const router = express.Router();

// GET cafeteria info, categories, and menu items
router.get('/:cafeteriaId', async (req, res) => {
    try {
        const { cafeteriaId } = req.params;

        const { data: cafeteria, error: cafeteriaErr } = await supabase
            .from('cafeterias')
            .select('id, name, location, contact, profile_picture')
            .eq('id', cafeteriaId)
            .maybeSingle();

        if (cafeteriaErr) return res.status(500).json({ message: 'Database error' });
        if (!cafeteria) return res.status(404).json({ message: 'Cafeteria not found' });

        const { data: categories, error: catErr } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('cafeteria_id', cafeteriaId)
            .order('name', { ascending: true });

        if (catErr) return res.status(500).json({ message: 'Database error' });

        const { data: items, error: itemsErr } = await supabase
            .from('menu_items')
            .select('*')
            .eq('cafeteria_id', cafeteriaId)
            .order('id', { ascending: false });

        if (itemsErr) return res.status(500).json({ message: 'Database error' });

        res.json({ cafeteria, categories, items });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
