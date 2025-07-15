const express = require('express');
const axios = require('axios');
const Order = require('./models/order'); // Ensure this path is correct

const router = express.Router();

// Handle form submission
router.post('/submit', async (req, res) => {
    try {
        const { numberPaying, numberReceiving, bundleType } = req.body;

        console.log('📥 Form data received:', { numberPaying, numberReceiving, bundleType });

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
                return res.status(400).json({ message: '❌ Invalid bundle type' });
        }

        // Format phone number to international if necessary
        const formattedMsisdn = numberPaying.startsWith('0')
            ? '254' + numberPaying.slice(1)
            : numberPaying;

        // Generate unique transaction reference
        const reference = Date.now().toString();

        // Save order to MongoDB
        const newOrder = new Order({
            numberReceiving,
            numberPaying: formattedMsisdn,
            data: bundleType,
            amount,
            reference
        });

        console.log('💾 Saving order:', newOrder);
        await newOrder.save();
        console.log('✅ Order saved to database.');

        // Prepare API data for STK push
        const apiData = {
            api_key: 'UMPAY_5f89860699671567fa5c184554e954ce214c8a12a7be494a1a35fed1',
            email: "michaeltemu20@gmail.com",
            account_id: "UMS11748169",
            amount: amount,
            msisdn: formattedMsisdn,
            reference: reference
        };

        console.log('📤 Sending STK push with:', apiData);

        const response = await axios.post(
            'https://api.umspay.co.ke/api/v1/initiatestkpush',
            apiData,
            { headers: { 'Content-Type': 'application/json' } }
        );

        console.log('✅ API Response:', response.data);

        res.status(200).json({ message: 'Order submitted!<br>Enter PIN to complete transaction.' });

    } catch (error) {
        if (error.response) {
            console.error('❌ API Error:', error.response.data);
            res.status(500).json({ message: 'API Error', details: error.response.data });
        } else {
            console.error('❌ Request Error:', error.message);
            res.status(500).json({ message: 'Request Error', details: error.message });
        }
    }
});

module.exports = router;
