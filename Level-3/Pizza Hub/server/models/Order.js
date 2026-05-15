const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        name: String,
        category: String,
        price: Number
    }],
    totalAmount: { type: Number, required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    orderStatus: { type: String, enum: ['Order Received', 'In the kitchen', 'Sent to delivery'], default: 'Order Received' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
