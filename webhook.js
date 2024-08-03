require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const Order = require('./models/order'); // Ensure the path is correct

const router = express.Router();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { dbName: 'balance' })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process if connection fails
  });

// Handle webhook data
router.post('/', async (req, res) => {
    try {
        const {
            ResponseCode,
            Msisdn,
            TransactionAmount,
            TransactionReference,
            MerchantRequestID
        } = req.body;

        if (ResponseCode === 0) {
            // Modify Msisdn format
            const formattedMsisdn = Msisdn.replace(/^254/, '0');

            // Find order with numberPaying matching formattedMsisdn
            const order = await Order.findOne({ numberPaying: formattedMsisdn });

            if (order) {
                const { numberReceiving, data } = order;
                
                // Prepare SMS data
                const smsData = {
                    api_key: 'MFpXSFJMRzg6bGt1NHN5dHQ=',
                    email: 'michaeltemu20@gmail.com',
                    Sender_Id: 'UMS_SMS',
                    message: `Number paying is ${formattedMsisdn} for number receiving: ${numberReceiving}, data: ${data}`,
                    phone: '254113382703'
                };

                // Send SMS request
                await axios.post('https://api.umeskiasoftwares.com/api/v1/sms', smsData, {
                    headers: { 'Content-Type': 'application/json' }
                });

                console.log('SMS sent successfully.');

                // Delete order from database
                await Order.deleteOne({ numberPaying: formattedMsisdn });

                console.log('Order deleted from database.');
            } else {
                console.log('No order found with numberPaying:', formattedMsisdn);
            }

            res.status(200).send('Webhook processed successfully.');
        } else {
            res.status(400).send('Invalid response code.');
        }
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).send('An error occurred while processing the webhook.');
    }
});

module.exports = router;
