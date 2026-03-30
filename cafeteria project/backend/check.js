require('dotenv').config();
const supabase = require('./database');
const bcrypt = require('bcryptjs');

async function check() {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
        console.error("Error", error);
        return;
    }
    console.log("Users in Supabase:");
    data.forEach(u => {
        console.log(`- ${u.email} (Role: ${u.role})`);
    });

    const admin = data.find(u => u.email === 'admin@culinary.edu');
    if (admin) {
        const matches13 = await bcrypt.compare('adminpassword', admin.password);
        console.log(`Password matches 'adminpassword': ${matches13}`);
    }
}
check();
