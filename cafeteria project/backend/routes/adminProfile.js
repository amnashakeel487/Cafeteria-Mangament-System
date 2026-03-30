const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../database');
const router = express.Router();

// Get admin profile
router.get('/', async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const { data: row, error } = await supabase
            .from('users')
            .select('id, name, email, contact, role')
            .eq('id', req.user.id)
            .eq('role', 'admin')
            .maybeSingle();

        if (error) return res.status(500).json({ message: "Database error" });
        if (!row) return res.status(404).json({ message: "Admin not found" });
        
        res.json(row);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update admin profile
router.put('/', async (req, res) => {
    try {
        const { name, email, password, contact } = req.body;
        
        const updateData = { name, email, contact };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.id)
            .eq('role', 'admin');

        if (error) return res.status(400).json({ message: "Email might be taken" });
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
