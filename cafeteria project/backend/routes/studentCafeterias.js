const express = require('express');
const db = require('../database');

const router = express.Router();

// GET all cafeterias (public info for students)
router.get('/', (req, res) => {
    db.all(`SELECT id, name, location, contact, profile_picture FROM cafeterias`, [], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

module.exports = router;
