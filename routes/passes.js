const express = require('express');
const router = express.Router();
const db = require('../db');

// Pricing logic for vehicles
const pricing = {
    cycle: { day: 20, week: 100, month: 350 },
    motorcycle: { day: 40, week: 200, month: 700 },
    car: { day: 60, week: 300, month: 1050 }
};

// Helper function to calculate the total cost
const calculateCost = (vehicleType, passType, quantity) => {
    return pricing[vehicleType][passType] * quantity;
};

// Purchase Pass
router.post('/purchase', (req, res) => {
    const { user_id, vehicle_type, pass_type, start_date, duration_in_days } = req.body;
    
    // Calculate the total cost and end date based on pass type and duration
    let endDate = new Date(start_date);
    let totalCost = 0;

    if (pass_type === 'day') {
        totalCost = calculateCost(vehicle_type, 'day', duration_in_days);
        endDate.setDate(endDate.getDate() + duration_in_days);
    } else if (pass_type === 'week') {
        let weeks = Math.floor(duration_in_days / 7);
        let remainingDays = duration_in_days % 7;
        totalCost = calculateCost(vehicle_type, 'week', weeks) + calculateCost(vehicle_type, 'day', remainingDays);
        endDate.setDate(endDate.getDate() + duration_in_days);
    } else if (pass_type === 'month') {
        let months = Math.floor(duration_in_days / 30);
        let remainingDays = duration_in_days % 30;
        totalCost = calculateCost(vehicle_type, 'month', months) + calculateCost(vehicle_type, 'day', remainingDays);
        endDate.setDate(endDate.getDate() + duration_in_days);
    }

    db.query(`INSERT INTO passes (user_id, vehicle_type, pass_type, start_date, end_date, total_cost) 
        VALUES (?, ?, ?, ?, ?, ?)`, 
        [user_id, vehicle_type, pass_type, start_date, endDate, totalCost], 
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Pass purchased successfully", pass_id: result.insertId });
        }
    );
});

// View Active Pass
router.get('/active/:user_id', (req, res) => {
    const { user_id } = req.params;

    db.query(`SELECT * FROM passes WHERE user_id = ? AND NOW() BETWEEN start_date AND end_date`, 
        [user_id], (err, passes) => {
            if (err) return res.status(500).json({ error: err.message });
            if (passes.length === 0) return res.status(404).json({ message: "No active pass found" });
            res.json(passes[0]);  // Return the first active pass found
        }
    );
});

// Rate Calculation API
router.post('/calculate-rate', (req, res) => {
    const { vehicle_type, duration_in_days } = req.body;
    
    let totalCost = 0;
    
    let months = Math.floor(duration_in_days / 30);
    let remainingDaysAfterMonths = duration_in_days % 30;
    let weeks = Math.floor(remainingDaysAfterMonths / 7);
    let remainingDays = remainingDaysAfterMonths % 7;
    
    totalCost += calculateCost(vehicle_type, 'month', months);
    totalCost += calculateCost(vehicle_type, 'week', weeks);
    totalCost += calculateCost(vehicle_type, 'day', remainingDays);
    
    res.json({ total_cost: totalCost });
});

module.exports = router;
