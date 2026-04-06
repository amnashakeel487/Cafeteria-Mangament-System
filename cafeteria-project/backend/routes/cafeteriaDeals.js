const express = require('express');
const supabase = require('../database');
const { createUpload, uploadToSupabase } = require('../uploadHelper');
const router = express.Router();

const upload = createUpload('image', 10);

// GET all deals for this cafeteria
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('deals')
            .select('*')
            .eq('cafeteria_id', req.cafeteria.id)
            .order('id', { ascending: false });
        if (error) return res.status(500).json({ message: 'Database error' });
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST create deal
router.post('/', (req, res) => {
    const contentType = req.headers['content-type'] || '';
    const doInsert = async () => {
        try {
            const { title, description, original_price, deal_price, image_url } = req.body;
            if (!title || !deal_price) return res.status(400).json({ message: 'Title and deal price are required' });
            let finalImage = image_url || null;
            if (req.file) finalImage = await uploadToSupabase(req.file.buffer, 'deals', req.file.originalname, req.file.mimetype);
            const { data, error } = await supabase.from('deals').insert({
                cafeteria_id: req.cafeteria.id, title, description: description || '',
                original_price: original_price ? parseFloat(original_price) : null,
                deal_price: parseFloat(deal_price), image_url: finalImage, active: true
            }).select().single();
            if (error) return res.status(500).json({ message: 'Database error: ' + error.message });
            res.status(201).json(data);
        } catch (err) { res.status(500).json({ message: err.message }); }
    };
    if (contentType.includes('multipart/form-data')) {
        upload.single('image')(req, res, async (err) => {
            if (err) return res.status(400).json({ message: err.message });
            await doInsert();
        });
    } else { doInsert(); }
});

// PUT update deal
router.put('/:id', (req, res) => {
    const contentType = req.headers['content-type'] || '';
    const doUpdate = async () => {
        try {
            const { title, description, original_price, deal_price, image_url, active } = req.body;
            const updateData = { title, description, deal_price: parseFloat(deal_price), active };
            if (original_price !== undefined) updateData.original_price = original_price ? parseFloat(original_price) : null;
            if (image_url !== undefined) updateData.image_url = image_url || null;
            if (req.file) updateData.image_url = await uploadToSupabase(req.file.buffer, 'deals', req.file.originalname, req.file.mimetype);
            const { error } = await supabase.from('deals').update(updateData)
                .eq('id', req.params.id).eq('cafeteria_id', req.cafeteria.id);
            if (error) return res.status(500).json({ message: 'Database error' });
            res.json({ message: 'Deal updated' });
        } catch (err) { res.status(500).json({ message: err.message }); }
    };
    if (contentType.includes('multipart/form-data')) {
        upload.single('image')(req, res, async (err) => {
            if (err) return res.status(400).json({ message: err.message });
            await doUpdate();
        });
    } else { doUpdate(); }
});

// DELETE deal
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase.from('deals').delete()
            .eq('id', req.params.id).eq('cafeteria_id', req.cafeteria.id);
        if (error) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Deal deleted' });
    } catch (err) { res.status(500).json({ message: 'Server error' }); }
});

module.exports = router;
