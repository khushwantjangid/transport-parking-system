const express = require('express');
const router = express.Router();
const db = require('../db');

// Inquire about a parking slot
router.post('/inquire', (req, res) => {
    const { user_id, slot_id } = req.body;

    // Check if the slot is currently unavailable
    db.query(`SELECT * FROM parking_slots WHERE id = ? AND is_available = false`, [slot_id], (err, slots) => {
        if (err) return res.status(500).json({ error: err.message });
        if (slots.length === 0) return res.status(400).json({ message: "Slot is already available" });

        // Store the inquiry in the database
        db.query(`INSERT INTO inquiries (user_id, slot_id) VALUES (?, ?)`, [user_id, slot_id], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Inquiry placed successfully. You'll be notified when the slot becomes available." });
        });
    });
});

module.exports = router;
