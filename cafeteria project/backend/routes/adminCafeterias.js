const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../database');
const router = express.Router();

// Get all cafeterias
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('cafeterias')
            .select('id, name, email, location, contact')
            .order('id', { descending: true });

        if (error) return res.status(500).json({ message: "Database error" });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Add cafeteria
router.post('/', async (req, res) => {
    try {
        const { name, email, password, location, contact } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { data, error } = await supabase
            .from('cafeterias')
            .insert({
                name,
                email,
                password: hashedPassword,
                location,
                contact
            })
            .select()
            .single();

        if (error) return res.status(400).json({ message: "Email might be taken" });
        res.status(201).json({ id: data.id, name, email, location, contact });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update cafeteria
router.put('/:id', async (req, res) => {
    try {
        const { name, email, password, location, contact } = req.body;
        const { id } = req.params;
        
        const updateData = { name, email, location, contact };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
        
        const { error } = await supabase
            .from('cafeterias')
            .update(updateData)
            .eq('id', id);

        if (error) return res.status(400).json({ message: error.message });
        res.json({ id, name, email, location, contact });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Delete cafeteria
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('cafeterias')
            .delete()
            .eq('id', req.params.id);

        if (error) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Cafeteria deleted" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
