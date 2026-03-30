require('dotenv').config();
const supabase = require('./database');

async function testUpdate() {
    const { data: users } = await supabase.from('users').select('id, name, email').eq('role', 'admin');
    console.log("Admin before update:", users[0]);
    if (!users.length) return;

    const reqBody = { name: "Test Admin", email: "student@culinary.edu" }; // Wait, screenshot says student@culinary.edu!
    
    const { data, error } = await supabase
        .from('users')
        .update({ name: reqBody.name, email: reqBody.email })
        .eq('id', users[0].id);

    console.log("Error:", error);
}
testUpdate();
