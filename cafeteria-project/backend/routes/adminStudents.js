const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../database');
const { sendEmail } = require('../config/brevo');
const {
    approvalEmailTemplate,
    rejectionEmailTemplate,
} = require('../utils/emailTemplates');

const router = express.Router();

const studentListFields =
    'id, name, email, contact, status, rejection_reason, status_updated_at, status_updated_by, registration_email_sent, created_at';

// Get all students (approved + pending + rejected)
router.get('/', async (req, res) => {
    try {
        const { data: rows, error } = await supabase
            .from('users')
            .select(studentListFields)
            .eq('role', 'student')
            .order('id', { ascending: false });

        if (error) return res.status(500).json({ message: 'Database error' });

        const sorted = (rows || []).sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (b.status === 'pending' && a.status !== 'pending') return 1;
            return (b.id || 0) - (a.id || 0);
        });

        res.json(sorted);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve a pending student
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (status !== 'approved') {
            return res.status(400).json({
                message: 'Use PATCH /:id/reject for rejections. This endpoint only approves.',
            });
        }

        const { data: student, error: fetchErr } = await supabase
            .from('users')
            .select('id, name, email, status')
            .eq('id', req.params.id)
            .eq('role', 'student')
            .maybeSingle();

        if (fetchErr) return res.status(500).json({ message: 'Database error' });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        if (student.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending registrations can be approved' });
        }

        const adminId = req.user?.id ? String(req.user.id) : 'admin';
        const now = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('users')
            .update({
                status: 'approved',
                rejection_reason: null,
                status_updated_at: now,
                status_updated_by: adminId,
            })
            .eq('id', req.params.id)
            .eq('role', 'student')
            .select(studentListFields)
            .single();

        if (error) return res.status(500).json({ message: 'Database error' });

        try {
            const template = approvalEmailTemplate(updated.name, updated.email);
            await sendEmail({
                to: { email: updated.email, name: updated.name },
                ...template,
            });
        } catch (emailError) {
            console.error('Email failed (non-critical):', emailError?.message || emailError);
        }

        res.json({ message: 'Student approved', student: updated });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Reject a pending student with reason
router.patch('/:id/reject', async (req, res) => {
    try {
        const { rejectionReason } = req.body;
        const reason = (rejectionReason || '').trim();
        if (reason.length < 10) {
            return res.status(400).json({ message: 'Rejection reason must be at least 10 characters' });
        }

        const { data: student, error: fetchErr } = await supabase
            .from('users')
            .select('id, name, email, status')
            .eq('id', req.params.id)
            .eq('role', 'student')
            .maybeSingle();

        if (fetchErr) return res.status(500).json({ message: 'Database error' });
        if (!student) return res.status(404).json({ message: 'Student not found' });
        if (student.status !== 'pending') {
            return res.status(400).json({ message: 'Only pending registrations can be rejected' });
        }

        const adminId = req.user?.id ? String(req.user.id) : 'admin';
        const now = new Date().toISOString();

        const { data: updated, error } = await supabase
            .from('users')
            .update({
                status: 'rejected',
                rejection_reason: reason,
                status_updated_at: now,
                status_updated_by: adminId,
            })
            .eq('id', req.params.id)
            .eq('role', 'student')
            .select(studentListFields)
            .single();

        if (error) return res.status(500).json({ message: 'Database error' });

        try {
            const template = rejectionEmailTemplate(updated.name, reason);
            await sendEmail({
                to: { email: updated.email, name: updated.name },
                ...template,
            });
        } catch (emailError) {
            console.error('Email failed (non-critical):', emailError?.message || emailError);
        }

        res.json({ message: 'Student rejected', student: updated });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add student (admin-created — approved immediately)
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
                contact,
                status: 'approved',
            })
            .select()
            .single();

        if (error) return res.status(400).json({ message: 'Email might be taken' });
        res.status(201).json({ id: data.id, name, email, contact });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
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
        res.status(500).json({ message: 'Server error' });
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

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json({ message: 'Student deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
