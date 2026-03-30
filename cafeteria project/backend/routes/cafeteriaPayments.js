const express = require('express');
const db = require('../database');
const router = express.Router();

// GET payment info for this cafeteria
router.get('/', (req, res) => {
    db.get(`SELECT * FROM payment_info WHERE cafeteria_id = ?`, [req.cafeteria.id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(row || null);
    });
});

// PUT upsert (add or update) payment info
router.put('/', (req, res) => {
    const {
        jazzcash_enabled, jazzcash_name, jazzcash_number,
        easypaisa_enabled, easypaisa_name, easypaisa_number,
        bank_name, bank_account, bank_instructions
    } = req.body;

    // Validate phone numbers if provided
    const phoneRegex = /^03\d{9}$/;
    if (jazzcash_number && !phoneRegex.test(jazzcash_number.replace(/[-\s]/g, ''))) {
        return res.status(400).json({ message: 'Invalid JazzCash number format. Use 03XXXXXXXXX' });
    }
    if (easypaisa_number && !phoneRegex.test(easypaisa_number.replace(/[-\s]/g, ''))) {
        return res.status(400).json({ message: 'Invalid EasyPaisa number format. Use 03XXXXXXXXX' });
    }

    db.run(`
        INSERT INTO payment_info (cafeteria_id, jazzcash_enabled, jazzcash_name, jazzcash_number,
            easypaisa_enabled, easypaisa_name, easypaisa_number, bank_name, bank_account, bank_instructions, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ON CONFLICT(cafeteria_id) DO UPDATE SET
            jazzcash_enabled = excluded.jazzcash_enabled,
            jazzcash_name = excluded.jazzcash_name,
            jazzcash_number = excluded.jazzcash_number,
            easypaisa_enabled = excluded.easypaisa_enabled,
            easypaisa_name = excluded.easypaisa_name,
            easypaisa_number = excluded.easypaisa_number,
            bank_name = excluded.bank_name,
            bank_account = excluded.bank_account,
            bank_instructions = excluded.bank_instructions,
            updated_at = CURRENT_TIMESTAMP
    `,
    [req.cafeteria.id,
     jazzcash_enabled ? 1 : 0, jazzcash_name || null, jazzcash_number || null,
     easypaisa_enabled ? 1 : 0, easypaisa_name || null, easypaisa_number || null,
     bank_name || null, bank_account || null, bank_instructions || null],
    function(err) {
        if (err) return res.status(500).json({ message: 'Database error: ' + err.message });
        res.json({ message: 'Payment settings saved successfully.' });
    });
});

// Public GET — for students to see a cafeteria's payment methods (no auth needed)
router.get('/public/:cafeteriaId', (req, res) => {
    db.get(`SELECT * FROM payment_info WHERE cafeteria_id = ?`, [req.params.cafeteriaId], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(row || null);
    });
});

module.exports = router;
