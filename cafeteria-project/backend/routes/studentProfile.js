const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../database');
const { createUpload, uploadToSupabase, deleteFromSupabase } = require('../uploadHelper');

const router = express.Router();
const upload = createUpload('avatar', 5);

// GET Student Profile
router.get('/', async (req, res) => {
    try {
        const studentId = req.user.id;
        
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, contact, profile_image')
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
        console.error('Student profile fetch error:', err);
        res.status(500).json({ 
            message: 'Internal Server Error fetching student profile', 
            details: err.message,
            stack: err.stack
        });
    }
});

// PUT Update Profile
router.put('/', async (req, res) => {
    try {
        const studentId = req.user.id;
        const { name, email, contact, profile_image } = req.body;
        
        if (!name) {
            return res.status(400).json({ message: 'Name is required' });
        }
        
        const updateData = { name, contact: contact || null };
        if (profile_image && profile_image.startsWith('http')) {
            updateData.profile_image = profile_image;
        } else if (profile_image === null) {
            updateData.profile_image = null;
        }

        const { error } = await supabase
            .from('users')
            .update(updateData)
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

// POST upload profile picture
router.post('/picture', (req, res) => {
    upload.single('avatar')(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message || 'File upload error' });
        }
        try {
            const studentId = req.user.id;
            let imageUrl = req.body.profile_image;

            if (req.file) {
                const { data: current } = await supabase
                    .from('users')
                    .select('profile_image')
                    .eq('id', studentId)
                    .maybeSingle();

                if (current?.profile_image) {
                    await deleteFromSupabase(current.profile_image);
                }
                imageUrl = await uploadToSupabase(req.file.buffer, 'avatars', req.file.originalname);
            }

            if (!imageUrl) return res.status(400).json({ message: 'No media provided' });

            const { error } = await supabase
                .from('users')
                .update({ profile_image: imageUrl })
                .eq('id', studentId);

            if (error) return res.status(500).json({ message: 'Database error: ' + error.message });
            res.json({ message: 'Profile media updated', profile_image: imageUrl });
        } catch (err) {
            console.error('Student picture upload error:', err);
            res.status(500).json({ message: err.message || 'Server error' });
        }
    });
});

module.exports = router;
