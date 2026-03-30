const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../database');

const router = express.Router();

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

        if (error) {
            console.error('Database error on student login:', error);
            return res.status(500).json({ message: 'Database error' });
        }

        if (!student) {
            // For demo purposes, auto-register students instead of failing if not found.
            const hashedPassword = await bcrypt.hash(password, 10);
            const newName = email.split('@')[0];
            const { data: newStudentArray, error: insertError } = await supabase
                .from('users')
                .insert({
                    name: newName,
                    email: email.trim(),
                    password: hashedPassword,
                    role: 'student'
                })
                .select();

            if (insertError) {
                console.error('Insert error inside auto-register:', insertError);
                return res.status(500).json({ message: 'Failed to auto-register student: ' + insertError.message });
            }

            const newStudent = newStudentArray[0];
            const tokenPayload = { id: newStudent.id, name: newStudent.name, email: newStudent.email, role: 'student' };
            const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });
            return res.json({ token, student: tokenPayload });
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
    } catch (err) {
        console.error('Unexpected error during login:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
