const express = require('express');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../database');
const router = express.Router();

// Multer for profile pictures
const avatarDir = path.join(__dirname, '../../frontend/public/avatars');
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
router.get('/', (req, res) => {
    db.get(`SELECT id, name, email, location, contact, profile_picture FROM cafeterias WHERE id = ?`, [req.cafeteria.id], (err, row) => {
        if (err || !row) return res.status(500).json({ message: 'Error fetching profile' });
        res.json(row);
    });
});

// PUT update profile details (name, location, contact)
router.put('/', (req, res) => {
    const { name, location, contact } = req.body;
    db.run(
        `UPDATE cafeterias SET name = ?, location = ?, contact = ? WHERE id = ?`,
        [name, location, contact, req.cafeteria.id],
        function(err) {
            if (err) return res.status(500).json({ message: 'Error updating profile' });
            res.json({ message: 'Profile updated successfully', name, location, contact });
        }
    );
});

// PUT update password
router.put('/password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    db.get(`SELECT password FROM cafeterias WHERE id = ?`, [req.cafeteria.id], async (err, row) => {
        if (err || !row) return res.status(500).json({ message: 'Error fetching user' });
        
        const isMatch = await bcrypt.compare(currentPassword, row.password);
        if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

        const hashed = await bcrypt.hash(newPassword, 10);
        db.run(`UPDATE cafeterias SET password = ? WHERE id = ?`, [hashed, req.cafeteria.id], function(err) {
            if (err) return res.status(500).json({ message: 'Error updating password' });
            res.json({ message: 'Password updated successfully' });
        });
    });
});

// POST upload profile picture
router.post('/picture', upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    
    const imageUrl = `/avatars/${req.file.filename}`;
    db.run(`UPDATE cafeterias SET profile_picture = ? WHERE id = ?`, [imageUrl, req.cafeteria.id], function(err) {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Profile picture updated', profile_picture: imageUrl });
    });
});

module.exports = router;
