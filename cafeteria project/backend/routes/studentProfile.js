const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../database');

const router = express.Router();

// GET Student Profile
router.get('/', (req, res) => {
    const studentId = req.user.id;
    
    db.get('SELECT id, name, email, contact FROM users WHERE id = ? AND role = ?', [studentId, 'student'], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'Student not found' });
        
        // Get order count
        db.get('SELECT COUNT(*) as orderCount FROM orders WHERE user_id = ?', [studentId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ ...user, orderCount: result?.orderCount || 0 });
        });
    });
});

// PUT Update Profile
router.put('/', (req, res) => {
    const studentId = req.user.id;
    const { name, email, contact } = req.body;
    
    if (!name || !email) {
        return res.status(400).json({ message: 'Name and email are required' });
    }
    
    db.run(
        'UPDATE users SET name = ?, email = ?, contact = ? WHERE id = ? AND role = ?',
        [name, email, contact || null, studentId, 'student'],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE constraint')) {
                    return res.status(409).json({ message: 'Email already in use' });
                }
                return res.status(500).json({ message: 'Failed to update profile' });
            }
            if (this.changes === 0) return res.status(404).json({ message: 'Student not found' });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// PUT Change Password
router.put('/password', (req, res) => {
    const studentId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    
    if (!oldPassword || !newPassword) {
        return res.status(400).json({ message: 'Both old and new passwords are required' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
    }
    
    db.get('SELECT password FROM users WHERE id = ? AND role = ?', [studentId, 'student'], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'Student not found' });
        
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });
        
        const hashed = await bcrypt.hash(newPassword, 10);
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashed, studentId], function(err) {
            if (err) return res.status(500).json({ message: 'Failed to change password' });
            res.json({ message: 'Password changed successfully' });
        });
    });
});

module.exports = router;
