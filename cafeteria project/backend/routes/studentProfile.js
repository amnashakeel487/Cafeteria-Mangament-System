const express = require('express');
const bcrypt = require('bcryptjs'); // standardizing on bcryptjs based on package.json usage
const supabase = require('../database');

const router = express.Router();

// GET Student Profile
router.get('/', async (req, res) => {
    try {
        const studentId = req.user.id;
        
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, contact')
            .eq('id', studentId)
            .eq('role', 'student')
            .maybeSingle();

        if (error) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'Student not found' });
        
        // Get order count
        const { count, error: countErr } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', studentId);

        if (countErr) return res.status(500).json({ message: 'Database error on order count' });
        
        res.json({ ...user, orderCount: count || 0 });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT Update Profile
router.put('/', async (req, res) => {
    try {
        const studentId = req.user.id;
        const { name, email, contact } = req.body;
        
        if (!name || !email) {
            return res.status(400).json({ message: 'Name and email are required' });
        }
        
        const { error } = await supabase
            .from('users')
            .update({ name, email, contact: contact || null })
            .eq('id', studentId)
            .eq('role', 'student');

        if (error) {
            if (error.message.includes('unique') || error.code === '23505') {
                return res.status(409).json({ message: 'Email already in use' });
            }
            return res.status(500).json({ message: 'Failed to update profile' });
        }
        
        res.json({ message: 'Profile updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// PUT Change Password
router.put('/password', async (req, res) => {
    try {
        const studentId = req.user.id;
        const { oldPassword, newPassword } = req.body;
        
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Both old and new passwords are required' });
        }
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }
        
        const { data: user, error } = await supabase
            .from('users')
            .select('password')
            .eq('id', studentId)
            .eq('role', 'student')
            .maybeSingle();

        if (error) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'Student not found' });
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
        
        const hashed = await bcrypt.hash(newPassword, 10);
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: hashed })
            .eq('id', studentId);

        if (updateError) return res.status(500).json({ message: 'Failed to change password' });
        
        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
