const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Inventory = require('../models/Inventory');
const Razorpay = require('razorpay');
const sendEmail = require('../utils/mailer');
const { auth, admin } = require('../middleware/auth');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Order (Razorpay)
router.post('/create', auth, async (req, res) => {
    try {
        const { amount, items, userId } = req.body;
        const options = {
            amount: amount * 100, // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_" + Date.now()
        };
        const rzpOrder = await razorpay.orders.create(options);
        
        const order = new Order({
            user: userId,
            items,
            totalAmount: amount,
            razorpayOrderId: rzpOrder.id
        });
        await order.save();
        
        res.json({ rzpOrder, orderId: order._id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Confirm Order & Update Stock
router.post('/confirm', auth, async (req, res) => {
    try {
        const { orderId, razorpayPaymentId } = req.body;
        const order = await Order.findById(orderId);
        if (!order) return res.status(404).json({ error: 'Order not found' });
        
        order.paymentStatus = 'paid';
        order.razorpayPaymentId = razorpayPaymentId;
        await order.save();
        
        // Update Stock
        for (const item of order.items) {
            const inventoryItem = await Inventory.findOne({ name: item.name });
            if (inventoryItem) {
                inventoryItem.stock -= 1;
                await inventoryItem.save();
                
                // Threshold Check
                if (inventoryItem.stock < inventoryItem.threshold) {
                    await sendEmail(process.env.EMAIL_USER, 'Low Stock Alert', `Stock for ${inventoryItem.name} is below threshold (${inventoryItem.stock} remaining).`);
                }
            }
        }
        
        res.json({ message: 'Order placed and stock updated', order });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Order Status (Admin)
router.put('/:id/status', auth, admin, async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { orderStatus: status }, { new: true });
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Orders
router.get('/user/:userId', auth, async (req, res) => {
    try {
        const orders = await Order.find({ user: req.params.userId }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Orders (Admin)
router.get('/', auth, admin, async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
