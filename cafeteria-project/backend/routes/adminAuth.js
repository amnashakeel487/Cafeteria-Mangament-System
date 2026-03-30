const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../database');

const router = express.Router();

// Seed initial admin if it doesn't exist
const seedAdmin = async () => {
    try {
        const adminEmail = 'admin@culinary.edu';
        const adminPassword = 'adminpassword';
        
        const { data: row, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', adminEmail)
            .maybeSingle();

        if (error) {
            console.error("Error checking for admin user", error);
            return;
        }

        if (!row) {
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            const { error: insertErr } = await supabase
                .from('users')
                .insert({
                    name: 'Alex Mercer',
                    email: adminEmail,
                    password: hashedPassword,
                    role: 'admin',
                    contact: '555-0199'
                });

            if (insertErr) console.error("Error seeding admin", insertErr.message);
            else console.log("Seeded default admin user: admin@culinary.edu / adminpassword");
        }
    } catch (err) {
        console.error("Unexpected error in seedAdmin", err);
    }
};

setTimeout(seedAdmin, 2000); // Give time for db to connect if needed

// Admin Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .eq('role', 'admin')
            .maybeSingle();

        if (error) return res.status(500).json({ message: "Database error" });
        if (!user) return res.status(401).json({ message: "Invalid credentials or not an admin" });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });
        
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ token, admin: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
