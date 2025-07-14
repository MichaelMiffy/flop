const express = require('express');
const axios = require('axios');
const Order = require('./models/order'); // Correct path to model

const router = express.Router();

// Handle form submission
router.post('/submit', async (req, res) => {
    try {
        const { numberPaying, numberReceiving, bundleType } = req.body;

        console.log('Form data received:', { numberPaying, numberReceiving, bundleType });

        let amount;
        switch (bundleType) {
            case '1.25GB till midnight - Ksh 55':
                amount = 55;
                break;
            case '2.5GB valid for 7 days - Ksh 300':
                amount = 300;
                break;
            case '350MBS valid for 7 days - Ksh 47':
                amount = 47;
                break;
            case '1.5GB valid for 3 hours - Ksh 49':
                amount = 49;
                break;
            case '6GB valid for 7 days - Ksh 700':
                amount = 700;
                break;
            case '1GB valid for 1 Hour - Ksh 19':
                amount = 19;
                break;
            case '250MBS valid for 24 Hours - Ksh 19':
                amount = 19;
                break;
            case '1GB valid for 24 Hours - Ksh 99':
                amount = 99;
                break;
            default:
                return res.status(400).send('Invalid bundle type');
        }

        const reference = Date.now().toString();

        // Store order in MongoDB
        const newOrder = new Order({
            numberReceiving,
            numberPaying,
            data: bundleType,
            amount,
            reference
        });

        console.log('Saving new order:', newOrder);

        await newOrder.save();
        console.log('Order saved to database.');

        const apiData = {
            api_key: 'UMPAY_5f89860699671567fa5c184554e954ce214c8a12a7be494a1a35fed1',
            email: 'michaeltemu20@gmail.com',
            account_id: 'UMS11748169',
            amount: amount,
            msisdn: numberPaying,
            reference: 12
        };

        console.log('Sending API request with data:', apiData);

        await axios.post('https://api.umeskiasoftwares.com/api/v1/intiatestk', apiData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        res.status(200).json({ message: 'Order Submitted successfully!<br>Enter PIN to complete' });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ message: 'An error occurred while processing your order.' });
    }
});

module.exports = router;
