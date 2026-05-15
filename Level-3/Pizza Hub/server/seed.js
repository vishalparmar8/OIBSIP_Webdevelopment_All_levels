const mongoose = require('mongoose');
const Inventory = require('./models/Inventory');
const Pizza = require('./models/Pizza');
require('dotenv').config();

const seedData = [
    // Bases
    { name: 'Thin Crust', category: 'base', stock: 50, price: 50 },
    { name: 'Thick Crust', category: 'base', stock: 50, price: 60 },
    { name: 'Cheese Burst', category: 'base', stock: 50, price: 100 },
    { name: 'Wheat Crust', category: 'base', stock: 50, price: 70 },
    { name: 'Gluten Free', category: 'base', stock: 50, price: 90 },
    // Sauces
    { name: 'Tomato Basil', category: 'sauce', stock: 100, price: 20 },
    { name: 'Spicy Marinara', category: 'sauce', stock: 100, price: 25 },
    { name: 'Garlic Parmesan', category: 'sauce', stock: 100, price: 30 },
    { name: 'Pesto', category: 'sauce', stock: 100, price: 40 },
    { name: 'BBQ', category: 'sauce', stock: 100, price: 35 },
    // Cheese
    { name: 'Mozzarella', category: 'cheese', stock: 100, price: 50 },
    { name: 'Cheddar', category: 'cheese', stock: 100, price: 60 },
    { name: 'Parmesan', category: 'cheese', stock: 100, price: 70 },
    // Veggies
    { name: 'Mushrooms', category: 'veggie', stock: 100, price: 20 },
    { name: 'Olives', category: 'veggie', stock: 100, price: 25 },
    { name: 'Onions', category: 'veggie', stock: 100, price: 15 },
    { name: 'Bell Peppers', category: 'veggie', stock: 100, price: 20 },
    { name: 'Jalapenos', category: 'veggie', stock: 100, price: 25 },
    // Meat
    { name: 'Pepperoni', category: 'meat', stock: 50, price: 80 },
    { name: 'Grilled Chicken', category: 'meat', stock: 50, price: 90 },
];

const pizzaData = [
    {
        name: 'Margherita Classic',
        description: 'Classic delight with 100% real mozzarella cheese',
        price: 299,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbad80ad38?auto=format&fit=crop&q=80&w=500',
        base: 'Thin Crust', sauce: 'Tomato Basil', cheese: 'Mozzarella'
    },
    {
        name: 'Farmhouse Special',
        description: 'Delightful combination of onion, capsicum, tomato & grilled mushroom',
        price: 399,
        image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=500',
        base: 'Thick Crust', sauce: 'Spicy Marinara', cheese: 'Cheddar', veggies: ['Onions', 'Bell Peppers', 'Mushrooms']
    },
    {
        name: 'Pepperoni Feast',
        description: 'Loaded with double pepperonni and mozzarella',
        price: 499,
        image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&q=80&w=500',
        base: 'Cheese Burst', sauce: 'Tomato Basil', cheese: 'Mozzarella', meat: 'Pepperoni'
    }
];

mongoose.connect(process.env.MONGO_URI)
    .then(async () => {
        await Inventory.deleteMany({});
        await Inventory.insertMany(seedData);
        await Pizza.deleteMany({});
        await Pizza.insertMany(pizzaData);
        console.log('Database Seeded with Inventory and Pizzas');
        process.exit();
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
