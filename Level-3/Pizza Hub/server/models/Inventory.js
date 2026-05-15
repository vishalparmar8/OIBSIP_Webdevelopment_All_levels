const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, enum: ['base', 'sauce', 'cheese', 'veggie', 'meat'], required: true },
    stock: { type: Number, required: true, default: 0 },
    threshold: { type: Number, default: 20 },
    price: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
