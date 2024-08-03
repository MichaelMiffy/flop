const mongoose = require('mongoose');

// Define schema for orders
const orderSchema = new mongoose.Schema({
    numberReceiving: String,
    numberPaying: String,
    data: String,
    amount: Number,
    reference: String
});

// Export the model
module.exports = mongoose.model('Order', orderSchema);
