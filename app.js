const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(bodyParser.json());

// Importing routes
const authRoutes = require('./routes/auth');
const parkingRoutes = require('./routes/parking');
const paymentRoutes = require('./routes/payments');
const passRoutes = require('./routes/passes');
const inquiryRoutes = require('./routes/inquiries');
const notificationRoutes = require('./routes/notifications');

// Activate the slot listener (Event listener for slot availability)
require('./listeners/slotListener');

// Use routes
app.use('/auth', authRoutes);
app.use('/parking-slots', parkingRoutes);
app.use('/payment', paymentRoutes);
app.use('/passes', passRoutes);
app.use('/inquiries', inquiryRoutes);
app.use('/notifications', notificationRoutes);

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
