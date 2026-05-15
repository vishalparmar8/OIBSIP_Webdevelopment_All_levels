const express = require('express');
const router = express.Router();
const Pizza = require('../models/Pizza');

// Get all pizza varieties
router.get('/', async (req, res) => {
    try {
        const pizzas = await Pizza.find();
        res.json(pizzas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
