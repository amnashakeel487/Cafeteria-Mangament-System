const express = require('express');
const db = require('../database');

const router = express.Router();

// GET cafeteria info, categories, and menu items
router.get('/:cafeteriaId', (req, res) => {
    const { cafeteriaId } = req.params;

    db.get(`SELECT id, name, location, contact, profile_picture FROM cafeterias WHERE id = ?`, [cafeteriaId], (err, cafeteria) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!cafeteria) return res.status(404).json({ message: 'Cafeteria not found' });

        db.all(`SELECT * FROM menu_categories WHERE cafeteria_id = ? ORDER BY name ASC`, [cafeteriaId], (err, categories) => {
            if (err) return res.status(500).json({ message: 'Database error' });

            db.all(`SELECT * FROM menu_items WHERE cafeteria_id = ? ORDER BY id DESC`, [cafeteriaId], (err, items) => {
                if (err) return res.status(500).json({ message: 'Database error' });

                res.json({ cafeteria, categories, items });
            });
        });
    });
});

module.exports = router;
