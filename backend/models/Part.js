const mongoose = require('mongoose');

const partSchema = new mongoose.Schema({
    partId: { type: String, required: true, unique: true },
    names: [{ type: String, required: true }], // Supports single or multiple names
    quantity: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    totalPrice: { type: Number, default: 0 },
    supplier: { type: String, required: true },
    location: { type: String, required: true },
    minStockThreshold: { type: Number, required: true, default: 5 },
    category: { type: String, required: true },
    dateAdded: { type: Date, default: Date.now }
}, { timestamps: true });

// Auto-calculate total price before saving
partSchema.pre('save', function (next) {
    this.totalPrice = this.quantity * this.price;
    next();
});

module.exports = mongoose.model('Part', partSchema);
