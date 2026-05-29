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

        if (existing) {
            const { data: existingUser } = await supabase
                .from('users')
                .select('id, name, email, status')
                .eq('email', email.trim())
                .maybeSingle();

            if (existingUser?.status === 'pending') {
                return res.status(200).json({
                    success: true,
                    alreadyRegistered: true,
                    message: 'Registration already submitted. Awaiting admin approval.',
                    data: {
                        id: existingUser.id,
                        name: existingUser.name,
                        email: existingUser.email,
                        approvalStatus: 'pending',
                    },
                });
            }
            return res.status(409).json({ message: 'Email already registered' });
        }

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

        if (error) {
            console.error('Student register DB error:', error);
            const hint =
                error.message?.includes('status') || error.code === '42703'
                    ? ' Run Supabase migrations (users.status column).'
                    : '';
            return res.status(500).json({
                message: 'Registration failed: ' + error.message + hint,
            });
        }

        const payload = {
            success: true,
            message: 'Registration successful. Awaiting admin approval.',
            emailSent: null,
            data: {
                id: newStudent.id,
                name: newStudent.name,
                email: newStudent.email,
                approvalStatus: 'pending',
            },
        };

        // Respond immediately so the client is not left waiting on email/API timeouts
        res.status(201).json(payload);

        const studentRow = { ...newStudent };
        const trimmedEmail = email.trim();
        setImmediate(async () => {
            try {
                await createNotification({
                    recipientType: 'admin',
                    recipientId: 'admin',
                    type: 'new_registration',
                    title: '👤 New Student Registration',
                    message: `${name} has registered and is awaiting approval`,
                    data: {
                        studentId: studentRow.id,
                        studentName: name,
                        studentEmail: trimmedEmail,
                    },
                });
            } catch (notifyErr) {
                console.error('Registration notification failed (non-critical):', notifyErr?.message);
            }

            try {
                const template = registrationReceivedTemplate(studentRow.name);
                const emailResult = await sendEmail({
                    to: { email: studentRow.email, name: studentRow.name },
                    ...template,
                });
                if (emailResult.success) {
                    const { error: flagErr } = await supabase
                        .from('users')
                        .update({ registration_email_sent: true })
                        .eq('id', studentRow.id);
                    if (flagErr) {
                        console.warn('registration_email_sent update skipped:', flagErr.message);
                    }
                }
            } catch (emailError) {
                console.error('Registration email failed (non-critical):', emailError?.message);
            }
        });
    } catch (err) {
        console.error('Student register error:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: err.message || 'Server error' });
        }
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
