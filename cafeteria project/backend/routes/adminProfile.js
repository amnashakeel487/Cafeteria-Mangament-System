const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');
const router = express.Router();

// Get admin profile
router.get('/', (req, res) => {
    // req.user is set by the auth middleware
    db.get(`SELECT id, name, email, contact, role, profile_image FROM users WHERE id = ? AND role = 'admin'`, [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!row) return res.status(404).json({ message: "Admin not found" });
        res.json(row);
    });
});

// Update admin profile
router.put('/', async (req, res) => {
    const { name, email, password, profile_image } = req.body;
    try {
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            db.run(`UPDATE users SET name = ?, email = ?, password = ?, profile_image = ? WHERE id = ? AND role = 'admin'`,
                [name, email, hashedPassword, profile_image, req.user.id],
                function(err) {
                    if (err) return res.status(400).json({ message: "Email might be taken" });
                    res.json({ message: "Profile updated successfully" });
                }
            );
        } else {
            db.run(`UPDATE users SET name = ?, email = ?, profile_image = ? WHERE id = ? AND role = 'admin'`,
                [name, email, profile_image, req.user.id],
                function(err) {
                    if (err) return res.status(400).json({ message: "Email might be taken" });
                    res.json({ message: "Profile updated successfully" });
                }
            );
        }
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
