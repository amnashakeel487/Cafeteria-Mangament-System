const express = require('express');
const supabase = require('../database');
const { itemIsAvailable, normalizeMenuItem } = require('../utils/menuAvailability');

const router = express.Router();

// POST check which cart/menu items are still available
router.post('/check-availability', async (req, res) => {
    try {
        const { menuItemIds, cafeteriaId } = req.body;
        if (!Array.isArray(menuItemIds) || menuItemIds.length === 0) {
            return res.status(400).json({ message: 'menuItemIds array is required' });
        }

        const ids = menuItemIds
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id) && id > 0);

        let query = supabase.from('menu_items').select('id, name, is_available, cafeteria_id').in('id', ids);
        if (cafeteriaId) {
            query = query.eq('cafeteria_id', cafeteriaId);
        }

        const { data: rows, error } = await query;
        if (error) return res.status(500).json({ message: 'Database error' });

        const unavailable = (rows || [])
            .filter((row) => !itemIsAvailable(row))
            .map((row) => ({ id: row.id, name: row.name }));

        res.json({ unavailable, allAvailable: unavailable.length === 0 });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

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

        res.json({
            cafeteria,
            categories,
            items: (items || []).map(normalizeMenuItem),
        });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
