const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');

const app = express();
app.use(bodyParser.json());

// Sample home route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// USSD route
app.post('/', async (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
    // Parse USSD request and respond
    let response = '';
  
    if (text == '') {
        response = `CON Welcome to Bus Ticketing System
1. View Routes
2. Buy Ticket`;
    } else if (text == '1') {
        try {
            const routes = await db.routes.findAll();
            response = 'CON Select a route:\n';
            routes.forEach((route, index) => {
                response += `${index + 1}. ${route.start_location} to ${route.end_location} - ${route.fare}\n`;
            });
        } catch (error) {
            console.error('Error fetching routes:', error);
            response = 'END Error fetching routes. Please try again later.';
        }
    }
  
    res.send(response);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000.');
});
