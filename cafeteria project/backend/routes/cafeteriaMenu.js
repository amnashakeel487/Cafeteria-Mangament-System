const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const router = express.Router();

// Ensure uploads dir exists
const uploadsDir = path.join(__dirname, '../../frontend/public/uploads');
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
router.get('/', (req, res) => {
    db.all(`SELECT * FROM menu_items WHERE cafeteria_id = ? ORDER BY id DESC`, [req.cafeteria.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

// POST add menu item
router.post('/', upload.single('image'), (req, res) => {
    const { name, price, category, description } = req.body;
    if (!name || !price || !category) return res.status(400).json({ message: 'Name, price and category are required.' });
    const image_url = req.file ? `/uploads/${req.file.filename}` : null;
    db.run(
        `INSERT INTO menu_items (cafeteria_id, name, price, category, description, image_url) VALUES (?, ?, ?, ?, ?, ?)`,
        [req.cafeteria.id, name, parseFloat(price), category, description || '', image_url],
        function(err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.status(201).json({ id: this.lastID, message: 'Menu item added successfully.' });
        }
    );
});

// PUT update menu item
router.put('/:id', upload.single('image'), (req, res) => {
    const { name, price, category, description } = req.body;
    const { id } = req.params;
    // Fetch current to preserve image if none uploaded
    db.get(`SELECT * FROM menu_items WHERE id = ? AND cafeteria_id = ?`, [id, req.cafeteria.id], (err, item) => {
        if (err || !item) return res.status(404).json({ message: 'Menu item not found.' });
        const image_url = req.file ? `/uploads/${req.file.filename}` : item.image_url;
        db.run(
            `UPDATE menu_items SET name = ?, price = ?, category = ?, description = ?, image_url = ? WHERE id = ? AND cafeteria_id = ?`,
            [name || item.name, parseFloat(price) || item.price, category || item.category, description ?? item.description, image_url, id, req.cafeteria.id],
            function(err) {
                if (err) return res.status(500).json({ message: 'Database error' });
                res.json({ message: 'Menu item updated successfully.' });
            }
        );
    });
});

// DELETE menu item
router.delete('/:id', (req, res) => {
    db.get(`SELECT * FROM menu_items WHERE id = ? AND cafeteria_id = ?`, [req.params.id, req.cafeteria.id], (err, item) => {
        if (err || !item) return res.status(404).json({ message: 'Menu item not found.' });
        // Remove old image file
        if (item.image_url) {
            const filePath = path.join(__dirname, '../../frontend/public', item.image_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        db.run(`DELETE FROM menu_items WHERE id = ? AND cafeteria_id = ?`, [item.id, req.cafeteria.id], (err) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ message: 'Menu item deleted successfully.' });
        });
    });
});

// --- CATEGORY MANAGEMENT ---

// GET categories
router.get('/categories', (req, res) => {
    db.all(`SELECT * FROM menu_categories WHERE cafeteria_id = ? ORDER BY name ASC`, [req.cafeteria.id], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        // If empty, auto-seed with standard categories
        if (rows.length === 0) {
            const defaults = ['Meals', 'Snacks', 'Drinks'];
            const placeholders = defaults.map(() => '(?, ?)').join(',');
            const values = defaults.flatMap(name => [req.cafeteria.id, name]);
            db.run(`INSERT INTO menu_categories (cafeteria_id, name) VALUES ${placeholders}`, values, function(err) {
                if (err) return res.status(500).json({ message: 'Error seeding categories' });
                db.all(`SELECT * FROM menu_categories WHERE cafeteria_id = ? ORDER BY name ASC`, [req.cafeteria.id], (err, newRows) => {
                    res.json(newRows || []);
                });
            });
        } else {
            res.json(rows);
        }
    });
});

// POST new category
router.post('/categories', (req, res) => {
    const { name } = req.body;
    if (!name || name.trim() === '') return res.status(400).json({ message: 'Category name is required' });
    
    // Check if it already exists
    db.get(`SELECT * FROM menu_categories WHERE cafeteria_id = ? AND LOWER(name) = ?`, [req.cafeteria.id, name.trim().toLowerCase()], (err, existing) => {
        if (existing) return res.status(400).json({ message: 'Category already exists' });
        
        db.run(`INSERT INTO menu_categories (cafeteria_id, name) VALUES (?, ?)`, [req.cafeteria.id, name.trim()], function(err) {
            if (err) return res.status(500).json({ message: 'Error adding category' });
            res.status(201).json({ id: this.lastID, name: name.trim() });
        });
    });
});

// DELETE category
router.delete('/categories/:id', (req, res) => {
    // Check if category has items
    db.get(`SELECT name FROM menu_categories WHERE id = ? AND cafeteria_id = ?`, [req.params.id, req.cafeteria.id], (err, cat) => {
        if (err || !cat) return res.status(404).json({ message: 'Category not found' });
        
        db.get(`SELECT id FROM menu_items WHERE cafeteria_id = ? AND category = ? LIMIT 1`, [req.cafeteria.id, cat.name], (err, item) => {
            if (item) return res.status(400).json({ message: 'Cannot delete category that has menu items. Reassign items first.' });
            
            db.run(`DELETE FROM menu_categories WHERE id = ? AND cafeteria_id = ?`, [req.params.id, req.cafeteria.id], (err) => {
                if (err) return res.status(500).json({ message: 'Error deleting category' });
                res.json({ message: 'Category deleted' });
            });
        });
    });
});

module.exports = router;
