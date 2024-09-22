const express = require('express');
const router = express.Router();
const db = require('../db');

const slotEmitter = require('../events');  // Import the event emitter

// View Available Slots
router.get('/availability', (req, res) => {
    db.query(`SELECT * FROM parking_slots WHERE is_available = true`, (err, slots) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(slots);
    });
});

// Book a Parking Slot
router.post('/book', (req, res) => {
    const { user_id, slot_id, start_date, end_date, pass_type, total_cost } = req.body;

    // Check if the slot is available
    db.query(`SELECT is_available FROM parking_slots WHERE id = ?`, [slot_id], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });

        // If no slot is found or the slot is not available, return an error
        if (results.length === 0) {
            return res.status(404).json({ message: "Slot not found" });
        } else if (!results[0].is_available) {
            return res.status(400).json({ message: "Slot is not available" });
        }

        // Proceed with booking if the slot is available
        db.query(
            `INSERT INTO bookings (user_id, slot_id, start_date, end_date, pass_type, total_cost) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
            [user_id, slot_id, start_date, end_date, pass_type, total_cost],
            (err, result) => {
                if (err) return res.status(500).json({ error: err.message });

                // Update the slot to mark it as unavailable
                db.query(`UPDATE parking_slots SET is_available = false WHERE id = ?`, [slot_id], (err) => {
                    if (err) return res.status(500).json({ error: err.message });
                    res.json({ message: "Slot booked successfully" });
                });
            }
        );
    });
});




// Cancel Booking (mark slot available and emit event)
router.delete('/cancel/:bookingId', (req, res) => {
    const bookingId = req.params.bookingId;

    // Find the booking
    db.query(`SELECT * FROM bookings WHERE id = ?`, [bookingId], (err, bookings) => {
        if (err) return res.status(500).json({ error: err.message });
        if (bookings.length === 0) return res.status(404).json({ message: "Booking not found" });

        const slotId = bookings[0].slot_id;

        // Mark the slot as available
        db.query(`UPDATE parking_slots SET is_available = true WHERE id = ?`, [slotId], (err) => {
            if (err) return res.status(500).json({ error: err.message });

            // Emit an event for slot availability
            slotEmitter.emit('slotAvailable', slotId);  // Emit event for this slot

            // Notify the user about the cancellation
            res.json({ message: "Booking canceled and slot is now available" });
        });
    });
});


module.exports = router;
