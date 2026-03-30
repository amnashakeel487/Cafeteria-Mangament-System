const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const router = express.Router();

// Get all cafeterias
router.get('/', (req, res) => {
    db.all(`SELECT id, name, email, location, contact FROM cafeterias ORDER BY id DESC`, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
});

// Add cafeteria
router.post('/', async (req, res) => {
    const { name, email, password, location, contact } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        db.run(`INSERT INTO cafeterias (name, email, password, location, contact) VALUES (?, ?, ?, ?, ?)`,
            [name, email, hashedPassword, location, contact],
            function(err) {
                if (err) return res.status(400).json({ message: "Email might be taken" });
                res.status(201).json({ id: this.lastID, name, email, location, contact });
            });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update cafeteria
router.put('/:id', async (req, res) => {
    const { name, email, password, location, contact } = req.body;
    const { id } = req.params;
    try {
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            db.run(`UPDATE cafeterias SET name=?, email=?, password=?, location=?, contact=? WHERE id=?`,
                [name, email, hashedPassword, location, contact, id],
                function(err) {
                    if (err) return res.status(400).json({ message: err.message });
                    res.json({ id, name, email, location, contact });
                });
        } else {
            db.run(`UPDATE cafeterias SET name=?, email=?, location=?, contact=? WHERE id=?`,
                [name, email, location, contact, id],
                function(err) {
                    if (err) return res.status(400).json({ message: err.message });
                    res.json({ id, name, email, location, contact });
                });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete cafeteria
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM cafeterias WHERE id=?`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ message: "Database error" });
        if (this.changes === 0) return res.status(404).json({ message: "Cafeteria not found" });
        res.json({ message: "Cafeteria deleted" });
    });
});

module.exports = router;
