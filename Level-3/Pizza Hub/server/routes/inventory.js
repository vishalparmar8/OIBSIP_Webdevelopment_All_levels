const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

const { auth, admin } = require('../middleware/auth');

// Get all inventory
router.get('/', async (req, res) => {
    try {
        const inventory = await Inventory.find();
        res.json(inventory);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update stock
router.put('/:id', auth, admin, async (req, res) => {
    try {
        const { stock, threshold } = req.body;
        const item = await Inventory.findByIdAndUpdate(req.params.id, { stock, threshold }, { new: true });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Add new item
router.post('/', auth, admin, async (req, res) => {
    try {
        const item = new Inventory(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
