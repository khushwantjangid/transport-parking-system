const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all notifications for a user
router.get('/:user_id', (req, res) => {
    const { user_id } = req.params;

    db.query(`SELECT * FROM notifications WHERE user_id = ? AND is_read = false ORDER BY created_at DESC`, 
        [user_id], (err, notifications) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(notifications);
        }
    );
});

// Mark notification as read
router.put('/:notification_id/read', (req, res) => {
    const { notification_id } = req.params;

    db.query(`UPDATE notifications SET is_read = true WHERE id = ?`, [notification_id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Notification marked as read" });
    });
});

module.exports = router;
