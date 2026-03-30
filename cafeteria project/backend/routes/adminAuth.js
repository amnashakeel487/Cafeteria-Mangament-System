const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../database');

const router = express.Router();

// Seed initial admin if it doesn't exist
const seedAdmin = async () => {
    const adminEmail = 'admin@culinary.edu';
    const adminPassword = 'adminpassword';
    
    db.get(`SELECT * FROM users WHERE email = ?`, [adminEmail], async (err, row) => {
        if (!row && !err) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(adminPassword, salt);
            db.run(`INSERT INTO users (name, email, password, role, contact) VALUES (?, ?, ?, ?, ?)`,
                ['Alex Mercer', adminEmail, hashedPassword, 'admin', '555-0199'],
                (err) => {
                    if (err) console.error("Error seeding admin", err.message);
                    else console.log("Seeded default admin user: admin@culinary.edu / adminpassword");
                });
        }
    });
};

seedAdmin();

// Admin Login Route
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    db.get(`SELECT * FROM users WHERE email = ? AND role = 'admin'`, [email], async (err, user) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (!user) return res.status(401).json({ message: "Invalid credentials or not an admin" });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });
        
        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
        
        res.json({ token, admin: { name: user.name, email: user.email } });
    });
});

module.exports = router;
