const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../database');
const router = express.Router();

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        const allowed = /jpeg|jpg|png|webp/;
        if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
        else cb(new Error('Only image files are allowed'));
    }
});

// GET all menu items for this cafeteria
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('cafeteria_id', req.cafeteria.id)
            .order('id', { descending: true });

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST add menu item
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description } = req.body;
        if (!name || !price || !category) return res.status(400).json({ message: 'Name, price and category are required.' });
        
        const image_url = req.file ? `/uploads/${req.file.filename}` : null;
        
        const { data, error } = await supabase
            .from('menu_items')
            .insert({
                cafeteria_id: req.cafeteria.id,
                name,
                price: parseFloat(price),
                category,
                description: description || '',
                image_url
            })
            .select()
            .single();

        if (error) return res.status(500).json({ message: 'Database error' });
        res.status(201).json({ id: data.id, message: 'Menu item added successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT update menu item
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, price, category, description } = req.body;
        const { id } = req.params;
        
        // Fetch current to preserve image if none uploaded
        const { data: item, error: fetchErr } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', id)
            .eq('cafeteria_id', req.cafeteria.id)
            .maybeSingle();

        if (fetchErr || !item) return res.status(404).json({ message: 'Menu item not found.' });
        
        const image_url = req.file ? `/uploads/${req.file.filename}` : item.image_url;
        
        const { error: updateErr } = await supabase
            .from('menu_items')
            .update({
                name: name || item.name,
                price: parseFloat(price) || item.price,
                category: category || item.category,
                description: description ?? item.description,
                image_url
            })
            .eq('id', id)
            .eq('cafeteria_id', req.cafeteria.id);

        if (updateErr) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Menu item updated successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE menu item
router.delete('/:id', async (req, res) => {
    try {
        const { data: item, error: fetchErr } = await supabase
            .from('menu_items')
            .select('*')
            .eq('id', req.params.id)
            .eq('cafeteria_id', req.cafeteria.id)
            .maybeSingle();

        if (fetchErr || !item) return res.status(404).json({ message: 'Menu item not found.' });
        
        // Remove old image file
        if (item.image_url && item.image_url.startsWith('/uploads/')) {
            const filePath = path.join(__dirname, '../../public', item.image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        
        const { error: delErr } = await supabase
            .from('menu_items')
            .delete()
            .eq('id', item.id)
            .eq('cafeteria_id', req.cafeteria.id);

        if (delErr) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Menu item deleted successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// --- CATEGORY MANAGEMENT ---

// GET categories
router.get('/categories', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('cafeteria_id', req.cafeteria.id)
            .order('name', { ascending: true });

        if (error) return res.status(500).json({ message: 'Database error' });
        
        // If empty, auto-seed with standard categories
        if (!rows || rows.length === 0) {
            const defaults = ['Meals', 'Snacks', 'Drinks'];
            const toInsert = defaults.map(name => ({
                cafeteria_id: req.cafeteria.id,
                name: name
            }));
            
            const { error: insertErr } = await supabase
                .from('menu_categories')
                .insert(toInsert);

            if (insertErr) return res.status(500).json({ message: 'Error seeding categories' });
            
            const { data: newRows } = await supabase
                .from('menu_categories')
                .select('*')
                .eq('cafeteria_id', req.cafeteria.id)
                .order('name', { ascending: true });

            return res.json(newRows || []);
        }
        
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST new category
router.post('/categories', async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') return res.status(400).json({ message: 'Category name is required' });
        
        // Check if it already exists (case insensitive match handled in code or DB)
        const { data: existing, error: existErr } = await supabase
            .from('menu_categories')
            .select('*')
            .eq('cafeteria_id', req.cafeteria.id)
            .ilike('name', name.trim())
            .maybeSingle();

        if (existing) return res.status(400).json({ message: 'Category already exists' });
        
        const { data: newCat, error: insertErr } = await supabase
            .from('menu_categories')
            .insert({ cafeteria_id: req.cafeteria.id, name: name.trim() })
            .select()
            .single();

        if (insertErr) return res.status(500).json({ message: 'Error adding category' });
        res.status(201).json({ id: newCat.id, name: name.trim() });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// DELETE category
router.delete('/categories/:id', async (req, res) => {
    try {
        // Check if category has items
        const { data: cat, error: catErr } = await supabase
            .from('menu_categories')
            .select('name')
            .eq('id', req.params.id)
            .eq('cafeteria_id', req.cafeteria.id)
            .maybeSingle();

        if (catErr || !cat) return res.status(404).json({ message: 'Category not found' });
        
        const { data: item } = await supabase
            .from('menu_items')
            .select('id')
            .eq('cafeteria_id', req.cafeteria.id)
            .eq('category', cat.name)
            .limit(1)
            .maybeSingle();

        if (item) return res.status(400).json({ message: 'Cannot delete category that has menu items. Reassign items first.' });
        
        const { error: delErr } = await supabase
            .from('menu_categories')
            .delete()
            .eq('id', req.params.id)
            .eq('cafeteria_id', req.cafeteria.id);

        if (delErr) return res.status(500).json({ message: 'Error deleting category' });
        res.json({ message: 'Category deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
