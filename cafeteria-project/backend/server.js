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
const studentAuthRoutes = require('./routes/studentAuth');
const studentCafeteriasRoutes = require('./routes/studentCafeterias');
const studentMenuRoutes = require('./routes/studentMenu');
const studentOrdersRoutes = require('./routes/studentOrders');
const studentProfileRoutes = require('./routes/studentProfile');

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

// --- Student Endpoints ---
app.use('/api/student', studentAuthRoutes);
app.use('/api/student/cafeterias', studentAuth, studentCafeteriasRoutes);
app.use('/api/student/menu', studentAuth, studentMenuRoutes);
app.use('/api/student/orders', studentAuth, studentOrdersRoutes);
app.use('/api/student/profile', studentAuth, studentProfileRoutes);

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

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

module.exports = app;
