const express = require('express');
const supabase = require('../database');
const router = express.Router();

// GET payment info for this cafeteria
router.get('/', async (req, res) => {
    try {
        const { data: row, error } = await supabase
            .from('payment_info')
            .select('*')
            .eq('cafeteria_id', req.cafeteria.id)
            .maybeSingle();

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json(row || null);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// PUT upsert (add or update) payment info
router.put('/', async (req, res) => {
    try {
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

        const { error } = await supabase
            .from('payment_info')
            .upsert({
                cafeteria_id: req.cafeteria.id,
                jazzcash_enabled: jazzcash_enabled ? 1 : 0,
                jazzcash_name: jazzcash_name || null,
                jazzcash_number: jazzcash_number || null,
                easypaisa_enabled: easypaisa_enabled ? 1 : 0,
                easypaisa_name: easypaisa_name || null,
                easypaisa_number: easypaisa_number || null,
                bank_name: bank_name || null,
                bank_account: bank_account || null,
                bank_instructions: bank_instructions || null,
                updated_at: new Date().toISOString()
            }, { onConflict: 'cafeteria_id' });

        if (error) return res.status(500).json({ message: 'Database error: ' + error.message });
        res.json({ message: 'Payment settings saved successfully.' });
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

// Public GET — for students to see a cafeteria's payment methods (no auth needed)
router.get('/public/:cafeteriaId', async (req, res) => {
    try {
        const { data: row, error } = await supabase
            .from('payment_info')
            .select('*')
            .eq('cafeteria_id', req.params.cafeteriaId)
            .maybeSingle();

        if (error) return res.status(500).json({ message: 'Database error' });
        res.json(row || null);
    } catch (err) {
        res.status(500).json({ message: 'Server error.' });
    }
});

module.exports = router;
