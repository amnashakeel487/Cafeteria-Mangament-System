const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    db.get('SELECT * FROM users WHERE email = ? AND role = ?', [email.trim(), 'student'], async (err, student) => {
        if (err) return res.status(500).json({ message: 'Database error' });

        if (!student) {
            // For demo purposes, auto-register students instead of failing if not found.
            // In production, this would be a separate register endpoint.
            const hashedPassword = await bcrypt.hash(password, 10);
            db.run(
                `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
                [email.split('@')[0], email.trim(), hashedPassword, 'student'],
                function(err) {
                    if (err) return res.status(500).json({ message: 'Failed to auto-register student: ' + err.message });
                    const newStudent = { id: this.lastID, name: email.split('@')[0], email: email.trim(), role: 'student' };
                    const token = jwt.sign(newStudent, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });
                    return res.json({ token, student: newStudent });
                }
            );
            return;
        }

        // Validate password
        const isValid = await bcrypt.compare(password, student.password);
        // Handle custom fallback: 'none' password was generated for generic Walk-in Customer
        if (!isValid && student.password !== password && student.password !== 'none') {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokenPayload = {
            id: student.id,
            name: student.name,
            email: student.email,
            role: 'student'
        };

        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });
        res.json({ token, student: tokenPayload });
    });
});

module.exports = router;
