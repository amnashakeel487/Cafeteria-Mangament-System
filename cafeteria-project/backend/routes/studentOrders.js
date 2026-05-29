const express = require('express');
const supabase = require('../database');
const { createUpload, uploadToSupabase } = require('../uploadHelper');
const {
    buildCancellationUpdate,
    assertStudentCanCancel,
} = require('../utils/orderCancellation');
const { createNotification } = require('../utils/notificationService');
const { itemIsAvailable } = require('../utils/menuAvailability');

const router = express.Router();

const upload = createUpload('screenshot', 5);

// Create Order endpoint
router.post('/', upload.single('screenshot'), async (req, res) => {
    try {
        const { cafeteria_id, total_amount, payment_method, items } = req.body;
        const student_id = req.user.id; // from studentAuth middleware
        
        if (!cafeteria_id || !total_amount || !items || !payment_method) {
            return res.status(400).json({ message: 'Missing order details' });
        }

        let parsedItems;
        try {
            parsedItems = typeof items === 'string' ? JSON.parse(items) : items;
        } catch (e) {
            return res.status(400).json({ message: 'Invalid items format' });
        }

        const menuItemIds = parsedItems
            .map((item) => item.id)
            .filter((id) => id != null && !String(id).startsWith('deal-'))
            .map((id) => Number(id))
            .filter((id) => !Number.isNaN(id) && id > 0);

        if (menuItemIds.length > 0) {
            const { data: menuRows, error: menuErr } = await supabase
                .from('menu_items')
                .select('id, name, is_available, cafeteria_id')
                .eq('cafeteria_id', cafeteria_id)
                .in('id', menuItemIds);

            if (menuErr) return res.status(500).json({ message: 'Failed to verify menu availability' });

            const unavailable = (menuRows || []).filter((row) => !itemIsAvailable(row));
            if (unavailable.length > 0) {
                return res.status(409).json({
                    message: 'Some items in your cart are no longer available',
                    unavailable: unavailable.map((r) => ({ id: r.id, name: r.name })),
                    code: 'ITEMS_UNAVAILABLE',
                });
            }
        }

        let screenshotUrl = null;
        if (req.file) {
            screenshotUrl = await uploadToSupabase(req.file.buffer, 'screenshots', req.file.originalname);
        }
        
        const status = 'pending';
        const payment_status = 'pending';

        const { data: newOrder, error: orderErr } = await supabase
            .from('orders')
            .insert({
                user_id: student_id,
                cafeteria_id,
                total_amount,
                status,
                payment_method,
                payment_screenshot: screenshotUrl,
                payment_status
            })
            .select()
            .single();

        if (orderErr) {
            console.error('Order insert error:', orderErr);
            return res.status(500).json({ message: 'Failed to create order' });
        }
        
        const orderId = newOrder.id;
        
        // Insert order items
        const orderItemsToInsert = parsedItems.map(item => ({
            order_id: orderId,
            item_name: item.name,
            quantity: item.qty,
            price: item.price
        }));

        const { error: itemsErr } = await supabase
            .from('order_items')
            .insert(orderItemsToInsert);

        if (itemsErr) {
            console.error('Order items insert error:', itemsErr);
        }

        try {
            const studentName = req.user.name || 'A student';
            const itemCount = parsedItems.reduce((sum, i) => sum + (Number(i.qty) || 1), 0);
            await createNotification({
                recipientType: 'cafeteria',
                recipientId: cafeteria_id,
                type: 'new_order',
                title: '🔔 New Order Received!',
                message: `Order #${orderId} from ${studentName} — Rs ${total_amount}`,
                data: {
                    orderId,
                    studentName,
                    total: total_amount,
                    itemCount,
                },
            });
        } catch (_) {
            /* non-blocking */
        }

        res.status(201).json({ message: 'Order created successfully', orderId });
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// GET Student Orders
router.get('/', async (req, res) => {
    try {
        const student_id = req.user.id;
        
        const { data: orders, error: ordersErr } = await supabase
            .from('orders')
            .select('*, cafeterias!inner(name, profile_picture)')
            .eq('user_id', student_id)
            .order('created_at', { ascending: false });

        if (ordersErr) {
            console.error('Orders fetch error:', ordersErr);
            return res.status(500).json({ message: 'Database error' });
        }
        
        if (!orders || orders.length === 0) return res.json([]);

        // Mangle the Supabase join result to match the old SQLite custom columns
        const formattedOrders = orders.map(o => {
            const row = {
                ...o,
                cafeteria_name: o.cafeterias?.name,
                cafeteria_image: o.cafeterias?.profile_picture
            };
            delete row.cafeterias;
            return row;
        });

        const orderIds = formattedOrders.map(o => o.id);
        
        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('*')
            .in('order_id', orderIds);

        if (itemsErr) {
            console.error('Items fetch error:', itemsErr);
            return res.status(500).json({ message: 'Database error' });
        }
        
        const ordersWithItems = formattedOrders.map(order => ({
            ...order,
            items: items.filter(i => i.order_id === order.id)
        }));
        
        res.json(ordersWithItems);
    } catch (err) {
        console.error('Unexpected error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// POST cancel order (student)
router.post('/:id/cancel', async (req, res) => {
    try {
        const student_id = req.user.id;
        const orderId = req.params.id;

        const { data: order, error: fetchErr } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', student_id)
            .maybeSingle();

        if (fetchErr) return res.status(500).json({ message: 'Database error' });
        if (!order) return res.status(404).json({ message: 'Order not found' });

        const check = assertStudentCanCancel(order);
        if (!check.ok) return res.status(check.status).json({ message: check.message });

        const updates = buildCancellationUpdate({
            cancelledBy: 'student',
            paymentMethod: order.payment_method,
        });

        const { data: updated, error: updateErr } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', orderId)
            .eq('user_id', student_id)
            .select()
            .single();

        if (updateErr) return res.status(500).json({ message: 'Failed to cancel order' });

        try {
            const studentName = req.user.name || 'A student';
            await createNotification({
                recipientType: 'cafeteria',
                recipientId: order.cafeteria_id,
                type: 'order_cancelled',
                title: '❌ Order Cancelled by Student',
                message: `Order #${orderId} was cancelled by ${studentName}`,
                data: { orderId: order.id, studentName },
            });
        } catch (_) {
            /* non-blocking */
        }

        res.json({ message: 'Order cancelled successfully', order: updated });
    } catch (err) {
        console.error('Student cancel order error:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;
