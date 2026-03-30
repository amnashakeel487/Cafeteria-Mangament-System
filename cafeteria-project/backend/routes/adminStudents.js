const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../database');
const router = express.Router();

// Get all students
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('users')
            .select('id, name, email, contact')
            .eq('role', 'student')
            .order('id', { ascending: false });

        if (error) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Add student
router.post('/', async (req, res) => {
    try {
        const { name, email, password, contact } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data, error } = await supabase
            .from('users')
            .insert({
                name,
                email,
                password: hashedPassword,
                role: 'student',
                contact
            })
            .select()
            .single();

        if (error) return res.status(400).json({ message: "Email might be taken" });
        res.status(201).json({ id: data.id, name, email, contact });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        const { name, email, password, contact } = req.body;
        const { id } = req.params;
        
        const updateData = { name, email, contact };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', id)
            .eq('role', 'student');

        if (error) return res.status(400).json({ message: error.message });
        res.json({ id, name, email, contact });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', req.params.id)
            .eq('role', 'student');

        if (error) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Student deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
