const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'cafeteria.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) return console.error(err);

    db.serialize(() => {
        db.run('PRAGMA foreign_keys=OFF;');
        db.run('BEGIN TRANSACTION;');
        
        // Create new table without CHECK constraint on category
        db.run(`CREATE TABLE menu_items_new (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cafeteria_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            category TEXT DEFAULT 'Meals',
            description TEXT,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (cafeteria_id) REFERENCES cafeterias(id)
        )`);

        // Copy data
        db.run(`INSERT INTO menu_items_new SELECT * FROM menu_items`, function(err) {
            if (err) console.error("Error copying data", err);
        });

        // Drop old table
        db.run('DROP TABLE menu_items');

        // Rename new to old
        db.run('ALTER TABLE menu_items_new RENAME TO menu_items');

        db.run('COMMIT;', () => {
             db.run('PRAGMA foreign_keys=ON;');
             console.log("Migration complete: Removed CHECK constraint on menu_items.category");
        });
    });
});
