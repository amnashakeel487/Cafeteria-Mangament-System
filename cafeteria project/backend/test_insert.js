const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('C:/cafeteria project/backend/cafeteria.db');

db.serialize(() => {
    db.run(`INSERT INTO users (name, email, password, role) VALUES ('Walk-in Customer', 'walkin_test2@cafeteria.local', 'none', 'student')`, function(err) {
        if (err) return console.error('Error creating generic user:', err.message);
        const userId = this.lastID;
        console.log('User created:', userId);
        
        db.run(`INSERT INTO orders (user_id, cafeteria_id, total_amount, status, payment_method, payment_status)
                VALUES (?, 1, 10.50, 'processing', 'cash', 'approved')`, [userId], function(err) {
            if (err) return console.error('Error creating order:', err.message);
            console.log('Order created:', this.lastID);
        });
    });
});
