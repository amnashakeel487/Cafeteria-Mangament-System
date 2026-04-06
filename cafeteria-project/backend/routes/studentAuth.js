const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../database');

const router = express.Router();

// Register (pending approval)
router.post('/register', async (req, res) => {
    const { name, email, password, contact } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }
    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.trim())
            .maybeSingle();

        if (existing) return res.status(409).json({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const { error } = await supabase
            .from('users')
            .insert({ name, email: email.trim(), password: hashedPassword, role: 'student', contact: contact || null, status: 'pending' });

        if (error) return res.status(500).json({ message: 'Registration failed: ' + error.message });
        res.status(201).json({ message: 'Registration submitted. Awaiting admin approval.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const { data: student, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.trim())
            .eq('role', 'student')
            .maybeSingle();

        if (error) return res.status(500).json({ message: 'Database error' });

        if (!student) {
            return res.status(401).json({ message: 'Account not found. Please register first.' });
        }

        // Block pending students
        if (student.status === 'pending') {
            return res.status(403).json({ message: 'Your account is pending admin approval.' });
        }

        const isValid = await bcrypt.compare(password, student.password);
        if (!isValid && student.password !== password && student.password !== 'none') {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokenPayload = { id: student.id, name: student.name, email: student.email, role: 'student' };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });
        res.json({ token, student: tokenPayload });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
