require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const formHandler = require('./formHandler'); // Ensure the file exists in the root directory
const webhook = require('./webhook'); // Ensure the file exists in the root directory

// Initialize the Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies (for form submissions)
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Use formHandler for handling form submissions
app.use('/', formHandler);

// Use webhook handler for processing webhook events
app.use('/webhook', webhook);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
