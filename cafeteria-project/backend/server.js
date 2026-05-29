const express = require('express');
const cors = require('cors');
require('dotenv').config();

const supabase = require('./database');
const adminAuthRoutes = require('./routes/adminAuth');
const adminStudentsRoutes = require('./routes/adminStudents');
const adminCafeteriasRoutes = require('./routes/adminCafeterias');
const adminOrdersRoutes = require('./routes/adminOrders');
const adminDashboardRoutes = require('./routes/adminDashboard');
const adminProfileRoutes = require('./routes/adminProfile');
const cafeteriaAuthRoutes = require('./routes/cafeteriaAuth');
const cafeteriaDashboardRoutes = require('./routes/cafeteriaDashboard');
const cafeteriaMenuRoutes = require('./routes/cafeteriaMenu');
const cafeteriaPaymentsRoutes = require('./routes/cafeteriaPayments');
const cafeteriaOrdersRoutes = require('./routes/cafeteriaOrders');
const cafeteriaProfileRoutes = require('./routes/cafeteriaProfile');
const cafeteriaDealsRoutes = require('./routes/cafeteriaDeals');
const studentAuthRoutes = require('./routes/studentAuth');
const studentCafeteriasRoutes = require('./routes/studentCafeterias');
const studentMenuRoutes = require('./routes/studentMenu');
const studentOrdersRoutes = require('./routes/studentOrders');
const studentProfileRoutes = require('./routes/studentProfile');
const studentDealsRoutes = require('./routes/studentDeals');
const { buildRouter: buildNotificationRouter } = require('./routes/notificationRoutes');
const ratingsRouter = require('./routes/ratings');
const favoritesRouter = require('./routes/favorites');
const availabilityRouter = require('./routes/availability');
const { scheduleMidnightReset, runMidnightAvailabilityReset } = require('./utils/midnightReset');

const cafeteriaAuth = require('./middleware/cafeteriaAuth');
const studentAuth = require('./middleware/studentAuth');
const auth = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));


// Routes
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/students', auth, adminStudentsRoutes);
app.use('/api/admin/cafeterias', auth, adminCafeteriasRoutes);
app.use('/api/admin/orders', auth, adminOrdersRoutes);
app.use('/api/admin/dashboard', auth, adminDashboardRoutes);
app.use('/api/admin/profile', auth, adminProfileRoutes);
app.use('/api/cafeteria', cafeteriaAuthRoutes);
app.use('/api/cafeteria/dashboard', cafeteriaAuth, cafeteriaDashboardRoutes);
app.use('/api/cafeteria/menu', cafeteriaAuth, cafeteriaMenuRoutes);
app.use('/api/cafeteria/payments', cafeteriaAuth, cafeteriaPaymentsRoutes);
app.use('/api/cafeteria/orders', cafeteriaAuth, cafeteriaOrdersRoutes);
app.use('/api/cafeteria/profile', cafeteriaAuth, cafeteriaProfileRoutes);
app.use('/api/cafeteria/deals', cafeteriaAuth, cafeteriaDealsRoutes);
app.use('/api/cafeteria/availability', cafeteriaAuth, availabilityRouter);

// --- Student Endpoints ---
app.use('/api/student', studentAuthRoutes);
app.use('/api/student/cafeterias', studentAuth, studentCafeteriasRoutes);
app.use('/api/student/menu', studentAuth, studentMenuRoutes);
app.use('/api/student/orders', studentAuth, studentOrdersRoutes);
app.use('/api/student/profile', studentAuth, studentProfileRoutes);
app.use('/api/student/deals', studentAuth, studentDealsRoutes);
app.use('/api/student/favorites', studentAuth, favoritesRouter);
app.use(
  '/api/student/notifications',
  studentAuth,
  buildNotificationRouter({ recipientType: 'student', getRecipientId: (req) => req.user.id })
);
app.use(
  '/api/cafeteria/notifications',
  cafeteriaAuth,
  buildNotificationRouter({ recipientType: 'cafeteria', getRecipientId: (req) => req.cafeteria.id })
);
app.use(
  '/api/admin/notifications',
  auth,
  buildNotificationRouter({ recipientType: 'admin', getRecipientId: () => 'admin' })
);
app.use('/api/ratings', ratingsRouter);

app.get('/api/payments/public/:cafeteriaId', async (req, res) => {
    try {
        const { data: row, error } = await supabase
            .from('payment_info')
            .select('*')
            .eq('cafeteria_id', req.params.cafeteriaId)
            .maybeSingle();
            
        if (error) return res.status(500).json({ message: 'Database error' });
        res.json(row || null);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/', (req, res) => {
    res.send("Cafeteria API is running");
});

// Vercel / external cron: POST with header x-cron-secret matching CRON_SECRET
app.post('/api/cron/midnight-availability-reset', async (req, res) => {
    const secret = process.env.CRON_SECRET;
    if (secret && req.headers['x-cron-secret'] !== secret) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
        const result = await runMidnightAvailabilityReset();
        res.json({ ok: true, ...result });
    } catch (err) {
        console.error('Cron midnight reset:', err);
        res.status(500).json({ message: err.message || 'Reset failed' });
    }
});

if (!process.env.VERCEL) {
    scheduleMidnightReset();
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('API Error:', err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
