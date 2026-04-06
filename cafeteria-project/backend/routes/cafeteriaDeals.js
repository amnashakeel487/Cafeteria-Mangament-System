const express = require('express');
const supabase = require('../database');
const { createUpload, uploadToSupabase } = require('../uploadHelper');
const router = express.Router();
const upload = createUpload('image', 10);

// GET all deals with their items
router.get('/', async (req, res) => {
    try {
        const { data: deals, error } = await supabase
            .from('deals')
            .select('*, deal_items(*)')
            .eq('cafeteria_id', req.cafeteria.id)
            .order('id', { ascending: false });
        if (error) return res.status(500).json({ message: 'Database error: ' + error.message });
        res.json(deals);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create deal with items
router.post('/', async (req, res) => {
    try {
        const { title, description, deal_price, image_url, items } = req.body;
        if (!title || !deal_price) return res.status(400).json({ message: 'Title and deal price are required' });
        if (!items || items.length < 2) return res.status(400).json({ message: 'A deal must include at least 2 items' });

        const { data: deal, error } = await supabase
            .from('deals')
            .insert({ cafeteria_id: req.cafeteria.id, title, description: description || '', deal_price: parseFloat(deal_price), image_url: image_url || null, active: true })
            .select().single();
        if (error) return res.status(500).json({ message: 'Database error: ' + error.message });

        // Insert deal items
        const dealItems = items.map(item => ({
            deal_id: deal.id,
            menu_item_id: item.id,
            item_name: item.name,
            item_price: item.price
        }));
        const { error: itemsError } = await supabase.from('deal_items').insert(dealItems);
        if (itemsError) return res.status(500).json({ message: 'Failed to save deal items: ' + itemsError.message });

        res.status(201).json({ ...deal, deal_items: dealItems });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// PUT update deal
router.put('/:id', async (req, res) => {
    try {
        const { title, description, deal_price, image_url, active, items } = req.body;
        const { error } = await supabase.from('deals')
            .update({ title, description, deal_price: parseFloat(deal_price), image_url: image_url || null, active })
            .eq('id', req.params.id).eq('cafeteria_id', req.cafeteria.id);
        if (error) return res.status(500).json({ message: 'Database error' });

        // Replace items if provided
        if (items && items.length >= 2) {
            await supabase.from('deal_items').delete().eq('deal_id', req.params.id);
            const dealItems = items.map(item => ({ deal_id: parseInt(req.params.id), menu_item_id: item.id, item_name: item.name, item_price: item.price }));
            await supabase.from('deal_items').insert(dealItems);
        }
        res.json({ message: 'Deal updated' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE deal
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('deals').delete()
            .eq('id', req.params.id).eq('cafeteria_id', req.cafeteria.id);
        if (error) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Deal deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
