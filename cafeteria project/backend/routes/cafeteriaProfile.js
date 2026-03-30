const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const supabase = require('../database');
const router = express.Router();

// Multer for profile pictures
const avatarDir = path.join(__dirname, '../../public/avatars');
if (!fs.existsSync(avatarDir)) fs.mkdirSync(avatarDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
        cb(null, `cafeteria_${req.cafeteria.id}_${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase())
            ? cb(null, true) : cb(new Error('Only images allowed'));
    }
});

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

// PUT update profile details (name, location, contact)
router.put('/', async (req, res) => {
    try {
        const { name, location, contact } = req.body;
        
        const { error } = await supabase
            .from('cafeterias')
            .update({ name, location, contact })
            .eq('id', req.cafeteria.id);

        if (error) return res.status(500).json({ message: 'Error updating profile' });
        res.json({ message: 'Profile updated successfully', name, location, contact });
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

        if (updateError) return res.status(500).json({ message: 'Error updating password' });
        res.json({ message: 'Password updated successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// POST upload profile picture
router.post('/picture', upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
        
        const imageUrl = `/avatars/${req.file.filename}`;
        
        const { error } = await supabase
            .from('cafeterias')
            .update({ profile_picture: imageUrl })
            .eq('id', req.cafeteria.id);

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Profile picture updated', profile_picture: imageUrl });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
