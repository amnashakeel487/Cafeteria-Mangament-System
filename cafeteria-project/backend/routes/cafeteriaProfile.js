const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../database');
const { createUpload, uploadToSupabase, deleteFromSupabase } = require('../uploadHelper');
const router = express.Router();

const upload = createUpload('avatar', 5);

// GET profile
router.get('/', async (req, res) => {
    try {
        const { data: row, error } = await supabase
            .from('cafeterias')
            .select('id, name, email, location, contact, profile_picture')
            .eq('id', req.cafeteria.id)
            .maybeSingle();

        if (error || !row) return res.status(500).json({ message: 'Error fetching profile' });
        res.json(row);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT update profile details (name, location, contact, picture)
router.put('/', async (req, res) => {
    try {
        const { name, location, contact, profile_picture } = req.body;
        
        const { error } = await supabase
            .from('cafeterias')
            .update({ name, location, contact, profile_picture })
            .eq('id', req.cafeteria.id);

        if (error) return res.status(500).json({ message: 'Error updating profile' });
        res.json({ message: 'Profile updated successfully', name, location, contact, profile_picture });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT update password
router.put('/password', async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        const { data: row, error } = await supabase
            .from('cafeterias')
            .select('password')
            .eq('id', req.cafeteria.id)
            .maybeSingle();

        if (error || !row) return res.status(500).json({ message: 'Error fetching user' });
        
        const isMatch = await bcrypt.compare(currentPassword, row.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        const hashed = await bcrypt.hash(newPassword, 10);
        
        const { error: updateError } = await supabase
            .from('cafeterias')
            .update({ password: hashed })
            .eq('id', req.cafeteria.id);

        if (updateError) return res.status(500).json({ message: 'Error updating password', details: updateError.message });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST upload profile picture (handles both file upload and direct URL update)
router.post('/picture', upload.single('avatar'), async (req, res) => {
    try {
        let imageUrl = req.body.profile_picture;

        if (req.file) {
            // Fetch current profile to delete old image ONLY if we are uploading a new one to Supabase
            const { data: current } = await supabase
                .from('cafeterias')
                .select('profile_picture')
                .eq('id', req.cafeteria.id)
                .maybeSingle();

            if (current && current.profile_picture) {
                await deleteFromSupabase(current.profile_picture);
            }
            
            imageUrl = await uploadToSupabase(req.file.buffer, 'avatars', req.file.originalname);
        }

        if (!imageUrl && !req.file) {
            return res.status(400).json({ message: 'No file uploaded or URL provided' });
        }
        
        const { error } = await supabase
            .from('cafeterias')
            .update({ profile_picture: imageUrl })
            .eq('id', req.cafeteria.id);

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Profile media updated', profile_picture: imageUrl });
    } catch (err) {
        console.error('Cafeteria picture update error:', err);
        res.status(500).json({ 
            message: err.message || 'Server error during media update'
        });
    }
});

module.exports = router;
