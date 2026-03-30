require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./database');

async function seed() {
    try {
        console.log("Seeding Cafeteria...");
        const hashedCafeteriaPassword = await bcrypt.hash('cafeteriapassword', 10);
        const { error: error1 } = await supabase.from('cafeterias').insert({
            name: "Main Campus Cafe",
            email: "cafe@culinary.edu",
            password: hashedCafeteriaPassword,
            location: "Student Union Building",
            contact: "555-0200"
        });
        if (error1) console.log("Cafeteria already exists or error:", error1.message);
        else console.log("Cafeteria Created > Email: cafe@culinary.edu | Password: cafeteriapassword");

        console.log("Seeding Student...");
        const hashedStudentPassword = await bcrypt.hash('studentpassword', 10);
        const { error: error2 } = await supabase.from('users').insert({
            name: "John Doe",
            email: "student@culinary.edu",
            password: hashedStudentPassword,
            role: 'student',
            contact: "555-0300"
        });
        if (error2) console.log("Student already exists or error:", error2.message);
        else console.log("Student Created > Email: student@culinary.edu | Password: studentpassword");
        
    } catch (e) {
        console.error(e);
    }
}
seed();
