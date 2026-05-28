const express = require('express');
const supabase = require('../database');
const { createNotification } = require('../utils/notificationService');
const router = express.Router();

const ORDER_FIELDS =
    'id, total_amount, status, payment_method, payment_status, created_at, cancellation_reason, cancelled_by, cancelled_at, refund_status, refund_note, user_id, cafeteria_id';

function mapOrderRow(o) {
    return {
        id: o.id,
        total_amount: o.total_amount,
        status: o.status,
        payment_method: o.payment_method,
        payment_status: o.payment_status,
        date: o.created_at,
        cancellation_reason: o.cancellation_reason,
        cancelled_by: o.cancelled_by,
        cancelled_at: o.cancelled_at,
        refund_status: o.refund_status,
        refund_note: o.refund_note,
        student_name: o.users?.name,
        student_email: o.users?.email,
        cafeteria_name: o.cafeterias?.name,
        cafeteria_location: o.cafeterias?.location,
    };
}

// GET cancelled orders with pending refunds (must be before /:id routes if added later)
router.get('/cancelled', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`${ORDER_FIELDS}, users!inner(name, email), cafeterias!inner(name, location)`)
            .eq('status', 'cancelled')
            .eq('refund_status', 'pending')
            .order('cancelled_at', { ascending: false });

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json((orders || []).map(mapOrderRow));
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// GET all orders (view + filters in UI)
router.get('/', async (req, res) => {
    try {
        const { data: orders, error } = await supabase
            .from('orders')
            .select(`${ORDER_FIELDS}, users!inner(name, email), cafeterias!inner(name, location)`)
            .order('id', { ascending: false });

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json((orders || []).map(mapOrderRow));
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// PATCH refund decision for a cancelled online order
router.patch('/:id/refund', async (req, res) => {
    try {
        const { refund_status, refund_note } = req.body;
        if (!['approved', 'rejected'].includes(refund_status)) {
            return res.status(400).json({ message: "refund_status must be 'approved' or 'rejected'" });
        }
        if (refund_status === 'rejected' && (!refund_note || !String(refund_note).trim())) {
            return res.status(400).json({ message: 'refund_note is required when rejecting a refund' });
        }

        const { data: order, error: fetchErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .maybeSingle();

        if (fetchErr) return res.status(500).json({ message: 'Database error' });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        if (order.status !== 'cancelled') {
            return res.status(400).json({ message: 'Refund can only be updated for cancelled orders' });
        }
        if (order.refund_status !== 'pending') {
            return res.status(400).json({ message: 'No pending refund request for this order' });
        }

        const { data: updated, error: updateErr } = await supabase
            .from('orders')
            .update({
                refund_status,
                refund_note: refund_status === 'rejected' ? String(refund_note).trim() : refund_note || null,
            })
            .eq('id', req.params.id)
            .select(`${ORDER_FIELDS}, users!inner(name, email), cafeterias!inner(name, location)`)
            .single();

        if (updateErr) return res.status(500).json({ message: 'Database error' });

        try {
            const approved = refund_status === 'approved';
            await createNotification({
                recipientType: 'student',
                recipientId: order.user_id,
                type: 'refund_update',
                title: approved ? '💰 Refund Approved' : '💰 Refund Update',
                message: approved
                    ? `Your refund for order #${order.id} has been approved.`
                    : `Your refund for order #${order.id} was not approved.${refund_note ? ` Note: ${refund_note}` : ''}`,
                data: {
                    orderId: order.id,
                    refund_status,
                    refund_note: refund_note || null,
                },
            });
        } catch (_) {
            /* non-blocking */
        }

        res.json({
            message: refund_status === 'approved' ? 'Refund approved' : 'Refund rejected',
            order: mapOrderRow(updated),
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
