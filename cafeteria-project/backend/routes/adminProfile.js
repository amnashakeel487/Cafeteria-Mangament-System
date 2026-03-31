const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../database');
const { createUpload, uploadToSupabase, deleteFromSupabase } = require('../uploadHelper');
const router = express.Router();

const upload = createUpload('avatar', 5);

// Get admin profile
router.get('/', async (req, res) => {
    try {
        // req.user is set by the auth middleware
        const { data: row, error } = await supabase
            .from('users')
            .select('id, name, email, contact, role, profile_image')
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
        const { name, email, password, contact, profile_image } = req.body;
        
        // Fetch current profile to see if email is actually changing
        const { data: current, error: fetchErr } = await supabase
            .from('users')
            .select('email')
            .eq('id', req.user.id)
            .maybeSingle();

        if (fetchErr) return res.status(500).json({ message: "Database check failed" });

        const updateData = { name, contact, profile_image };
        
        // Only include email in update if it's actually different from current
        if (email && current?.email && email.toLowerCase().trim() !== current.email.toLowerCase().trim()) {
            // Check if the new email is already taken by another user
            const { data: existing } = await supabase
                .from('users')
                .select('id')
                .eq('email', email.toLowerCase().trim())
                .neq('id', req.user.id)
                .maybeSingle();

            if (existing) {
                return res.status(409).json({ message: "Update failed. Email might be taken." });
            }
            updateData.email = email.toLowerCase().trim();
        }

        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', req.user.id)
            .eq('role', 'admin');

        if (error) {
            console.error('Admin update failure:', error);
            if (error.code === '23505' || error.message?.includes('unique')) {
                return res.status(409).json({ message: "Update failed. Email might be taken." });
            }
            return res.status(500).json({ message: "Update failed. Please try again." });
        }
        res.json({ message: "Profile updated successfully" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// POST upload profile picture (Supabase Storage)
router.post('/picture', upload.single('avatar'), async (req, res) => {
    try {
        let imageUrl = req.body.profile_image;

        if (req.file) {
            // Fetch current to delete old
            const { data: current } = await supabase
                .from('users')
                .select('profile_image')
                .eq('id', req.user.id)
                .maybeSingle();

            if (current && current.profile_image) {
                await deleteFromSupabase(current.profile_image);
            }
            imageUrl = await uploadToSupabase(req.file.buffer, 'avatars', req.file.originalname);
        }

        if (!imageUrl && !req.file) return res.status(400).json({ message: 'No media provided' });

        const { error } = await supabase
            .from('users')
            .update({ profile_image: imageUrl })
            .eq('id', req.user.id);

        if (error) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Profile media updated", profile_image: imageUrl });
    } catch (err) {
        console.error('Admin picture upload error:', err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
