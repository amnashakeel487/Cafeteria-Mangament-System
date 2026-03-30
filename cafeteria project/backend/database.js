const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'cafeteria.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        console.log("Connected to the SQLite database.");
        db.serialize(() => {
            // Users table: Admin, Students, etc.
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT CHECK(role IN ('admin', 'student', 'cafeteria')) NOT NULL,
                contact TEXT
            )`);
            
            // Cafeterias table
            db.run(`CREATE TABLE IF NOT EXISTS cafeterias (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                location TEXT,
                contact TEXT,
                profile_picture TEXT
            )`);
            db.run(`ALTER TABLE cafeterias ADD COLUMN profile_picture TEXT`, () => {});

            // Orders table
            db.run(`CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                cafeteria_id INTEGER NOT NULL,
                total_amount REAL NOT NULL,
                status TEXT CHECK(status IN ('pending', 'processing', 'completed', 'cancelled')) DEFAULT 'pending',
                payment_method TEXT DEFAULT 'cash',
                payment_screenshot TEXT,
                payment_status TEXT CHECK(payment_status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id),
                FOREIGN KEY (cafeteria_id) REFERENCES cafeterias(id)
            )`);
            // Migrate: add columns if upgrading from an older DB
            db.run(`ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'cash'`, () => {});
            db.run(`ALTER TABLE orders ADD COLUMN payment_screenshot TEXT`, () => {});
            db.run(`ALTER TABLE orders ADD COLUMN payment_status TEXT DEFAULT 'pending'`, () => {});
            // Order Items table
            db.run(`CREATE TABLE IF NOT EXISTS order_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id INTEGER NOT NULL,
                item_name TEXT NOT NULL,
                quantity INTEGER NOT NULL,
                price REAL NOT NULL,
                FOREIGN KEY (order_id) REFERENCES orders(id)
            )`);

            // Menu Categories table
            db.run(`CREATE TABLE IF NOT EXISTS menu_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cafeteria_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cafeteria_id) REFERENCES cafeterias(id)
            )`);

            // Menu Items table
            db.run(`CREATE TABLE IF NOT EXISTS menu_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cafeteria_id INTEGER NOT NULL,
                name TEXT NOT NULL,
                price REAL NOT NULL,
                category TEXT CHECK(category IN ('Meals', 'Snacks', 'Drinks')) DEFAULT 'Meals',
                description TEXT,
                image_url TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cafeteria_id) REFERENCES cafeterias(id)
            )`);

            // Payment Info table (one row per cafeteria)
            db.run(`CREATE TABLE IF NOT EXISTS payment_info (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cafeteria_id INTEGER UNIQUE NOT NULL,
                jazzcash_enabled INTEGER DEFAULT 1,
                jazzcash_name TEXT,
                jazzcash_number TEXT,
                easypaisa_enabled INTEGER DEFAULT 1,
                easypaisa_name TEXT,
                easypaisa_number TEXT,
                bank_name TEXT,
                bank_account TEXT,
                bank_instructions TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (cafeteria_id) REFERENCES cafeterias(id)
            )`);
        });
    }
});

module.exports = db;
