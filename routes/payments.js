const express = require('express');
const router = express.Router();
const db = require('../db');

// Make Payment
router.post('/', (req, res) => {
    const { booking_id, amount } = req.body;
    db.query(`INSERT INTO payments (booking_id, amount, payment_date) VALUES (?, ?, NOW())`, 
        [booking_id, amount], 
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Payment successful" });
        }
    );
});

// Payment History
router.get('/history/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    db.query(`
        SELECT payments.*, bookings.* FROM payments 
        INNER JOIN bookings ON payments.booking_id = bookings.id 
        WHERE bookings.user_id = ?`, 
        [user_id], 
        (err, payments) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(payments);
        }
    );
});

module.exports = router;
