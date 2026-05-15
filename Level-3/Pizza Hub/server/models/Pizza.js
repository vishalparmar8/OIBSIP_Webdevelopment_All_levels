const mongoose = require('mongoose');

const pizzaSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    price: { type: Number, required: true },
    base: { type: String },
    sauce: { type: String },
    cheese: { type: String },
    veggies: [String]
}, { timestamps: true });

module.exports = mongoose.model('Pizza', pizzaSchema);
