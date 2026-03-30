const express = require('express');
const supabase = require('../database');

const router = express.Router();

// GET all cafeterias (public info for students)
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('cafeterias')
            .select('id, name, location, contact, profile_picture');
            
        if (error) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
