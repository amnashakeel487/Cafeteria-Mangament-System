const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../database');
const { createNotification } = require('../utils/notificationService');
const { sendEmail } = require('../config/brevo');
const { registrationReceivedTemplate } = require('../utils/emailTemplates');
const { checkApprovalStatusLimit } = require('../utils/approvalRateLimit');

const router = express.Router();

function mapApprovalStatus(status) {
    if (status === 'approved') return 'approved';
    if (status === 'rejected') return 'rejected';
    return 'pending';
}

// Register (pending approval)
router.post('/register', async (req, res) => {
    const { name, email, password, contact } = req.body;
    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }
    try {
        const { data: existing } = await supabase
            .from('users')
            .select('id')
            .eq('email', email.trim())
            .maybeSingle();

        if (existing) return res.status(409).json({ message: 'Email already registered' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const { data: newStudent, error } = await supabase
            .from('users')
            .insert({
                name,
                email: email.trim(),
                password: hashedPassword,
                role: 'student',
                contact: contact || null,
                status: 'pending',
            })
            .select('id, name, email')
            .single();

        if (error) return res.status(500).json({ message: 'Registration failed: ' + error.message });

        try {
            await createNotification({
                recipientType: 'admin',
                recipientId: 'admin',
                type: 'new_registration',
                title: '👤 New Student Registration',
                message: `${name} has registered and is awaiting approval`,
                data: {
                    studentId: newStudent.id,
                    studentName: name,
                    studentEmail: email.trim(),
                },
            });
        } catch (_) {
            /* notification must not block registration */
        }

        let emailSent = false;
        try {
            const template = registrationReceivedTemplate(newStudent.name);
            const emailResult = await sendEmail({
                to: { email: newStudent.email, name: newStudent.name },
                ...template,
            });
            if (emailResult.success) {
                emailSent = true;
                await supabase
                    .from('users')
                    .update({ registration_email_sent: true })
                    .eq('id', newStudent.id);
            }
        } catch (emailError) {
            console.error('Email failed (non-critical):', emailError?.message || emailError);
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful. Awaiting admin approval.',
            emailSent,
            data: {
                id: newStudent.id,
                name: newStudent.name,
                email: newStudent.email,
                approvalStatus: 'pending',
            },
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Public approval status check (rate limited)
router.get('/approval-status', async (req, res) => {
    const email = (req.query.email || '').trim().toLowerCase();
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
    if (!checkApprovalStatusLimit(String(ip).split(',')[0].trim())) {
        return res.status(429).json({ message: 'Too many requests. Please try again in a minute.' });
    }

    try {
        const { data: student, error } = await supabase
            .from('users')
            .select('name, status, rejection_reason')
            .eq('email', email)
            .eq('role', 'student')
            .maybeSingle();

        if (error) return res.status(500).json({ message: 'Unable to check status' });
        if (!student) {
            return res.status(404).json({ message: 'No registration found for this email' });
        }

        res.json({
            approvalStatus: mapApprovalStatus(student.status),
            rejectionReason: student.rejection_reason || null,
            name: student.name,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const { data: student, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email.trim())
            .eq('role', 'student')
            .maybeSingle();

        if (error) return res.status(500).json({ message: 'Database error' });

        if (!student) {
            return res.status(401).json({ message: 'Account not found. Please register first.' });
        }

        if (student.status === 'pending') {
            return res.status(403).json({
                message: 'Your account is still pending admin approval. You will receive an email when it is ready.',
                code: 'REGISTRATION_PENDING',
            });
        }

        if (student.status === 'rejected') {
            return res.status(403).json({
                message: 'Your registration was not approved.',
                code: 'REGISTRATION_REJECTED',
                rejectionReason: student.rejection_reason || null,
            });
        }

        const isValid = await bcrypt.compare(password, student.password);
        if (!isValid && student.password !== password && student.password !== 'none') {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const tokenPayload = { id: student.id, name: student.name, email: student.email, role: 'student' };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });
        res.json({ token, student: tokenPayload });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
