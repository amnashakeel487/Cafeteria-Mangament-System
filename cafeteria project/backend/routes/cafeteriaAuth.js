const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');
const router = express.Router();

// POST /api/cafeteria/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    db.get(`SELECT * FROM cafeterias WHERE email = ?`, [email], async (err, cafeteria) => {
        if (err) return res.status(500).json({ message: 'Database error.' });
        if (!cafeteria) return res.status(401).json({ message: 'Invalid email or password.' });

        try {
            const isMatch = await bcrypt.compare(password, cafeteria.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid email or password.' });

            const token = jwt.sign(
                { id: cafeteria.id, email: cafeteria.email, role: 'cafeteria' },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.json({
                token,
                cafeteria: {
                    id: cafeteria.id,
                    name: cafeteria.name,
                    email: cafeteria.email,
                    location: cafeteria.location,
                    contact: cafeteria.contact,
                    role: 'cafeteria'
                }
            });
        } catch (err) {
            res.status(500).json({ message: 'Server error.' });
        }
    });
});

module.exports = router;
