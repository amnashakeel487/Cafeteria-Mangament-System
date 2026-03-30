const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const router = express.Router();

// Get all students
router.get('/', (req, res) => {
    db.all(`SELECT id, name, email, contact FROM users WHERE role = 'student' ORDER BY id DESC`, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    });
});

// Add student
router.post('/', async (req, res) => {
    const { name, email, password, contact } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        db.run(`INSERT INTO users (name, email, password, role, contact) VALUES (?, ?, ?, 'student', ?)`,
            [name, email, hashedPassword, contact],
            function(err) {
                if (err) return res.status(400).json({ message: "Email might be taken" });
                res.status(201).json({ id: this.lastID, name, email, contact });
            });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    const { name, email, password, contact } = req.body;
    const { id } = req.params;
    try {
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            db.run(`UPDATE users SET name=?, email=?, password=?, contact=? WHERE id=? AND role='student'`,
                [name, email, hashedPassword, contact, id],
                function(err) {
                    if (err) return res.status(400).json({ message: err.message });
                    res.json({ id, name, email, contact });
                });
        } else {
            db.run(`UPDATE users SET name=?, email=?, contact=? WHERE id=? AND role='student'`,
                [name, email, contact, id],
                function(err) {
                    if (err) return res.status(400).json({ message: err.message });
                    res.json({ id, name, email, contact });
                });
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete student
router.delete('/:id', (req, res) => {
    db.run(`DELETE FROM users WHERE id=? AND role='student'`, [req.params.id], function(err) {
        if (err) return res.status(500).json({ message: "Database error" });
        if (this.changes === 0) return res.status(404).json({ message: "Student not found" });
        res.json({ message: "Student deleted" });
    });
});

module.exports = router;
