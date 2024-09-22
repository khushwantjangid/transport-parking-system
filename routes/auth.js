const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../db');  // MySQL connection file

// Register
router.post('/register', async (req, res) => {
    const { name, email, password, vehicle_number } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    db.query(`INSERT INTO users (name, email, password, vehicle_number) VALUES (?, ?, ?, ?)`, 
        [name, email, hashedPassword, vehicle_number], 
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "User registered successfully" });
        }
    );
});

// Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.query(`SELECT * FROM users WHERE email = ?`, [email], async (err, users) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!users.length) return res.status(404).json({ message: "User not found" });

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ message: "Invalid credentials" });

        const token = jwt.sign({ userId: user.id }, 'secretKey', { expiresIn: '1h' });
        res.json({ token });
    });
});

module.exports = router;
