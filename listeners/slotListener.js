const db = require('../db');
const slotEmitter = require('../events');  // Import the event emitter

// Listen for the 'slotAvailable' event
slotEmitter.on('slotAvailable', (slotId) => {
    // Fetch all users who inquired about this slot
    db.query(`SELECT * FROM inquiries WHERE slot_id = ?`, [slotId], (err, inquiries) => {
        if (err) return console.error("Error fetching inquiries:", err);

        inquiries.forEach(inquiry => {
            const userId = inquiry.user_id;
            const message = `The parking slot you inquired about (Slot ID: ${slotId}) is now available.`;

            // Insert notification for each user who inquired
            db.query(`INSERT INTO notifications (user_id, message) VALUES (?, ?)`, [userId, message], (err) => {
                if (err) console.error(`Error notifying user ${userId}:`, err.message);
            });

            // Optional: You can send real-time notifications via WebSockets or Emails here
        });

        // Clear all inquiries for this slot (optional, as inquiries are now resolved)
        db.query(`DELETE FROM inquiries WHERE slot_id = ?`, [slotId], (err) => {
            if (err) console.error("Error clearing inquiries:", err.message);
        });

        console.log(`Notifications sent for slot ${slotId}`);
    });
});
