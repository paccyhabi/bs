const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models'); // Ensure this points to your database models
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// USSD Route
app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";
    const textArray = text.split('*');

    if (text === '') {
        response = `CON Welcome to the Bus Ticketing System!
        1. Buy tickets`;
        sendResponse(res, response);
    } else if (text === '1') {
        response = `CON Our destinations:
        1. Kigali-Nyamata 1000Rwf
        2. Gicumbi-Nyagatare 1200Rwf
        3. Musanze-Rubavu 1500Rwf
        4. Kigali-Huye 2000Rwf
        5. Rusizi-Nyamasheke 2500Rwf
        6. Kigali-Muhanga 1000Rwf
        7. Karongi-Rutsiro 1200Rwf
        8. Kigali-Rwamagana 900Rwf
        9. Gatsibo-Kayonza 1100Rwf
        10. Ngoma-Kirehe 1300Rwf`;
        sendResponse(res, response);
    } else if (text.startsWith('1*')) {
        const destinationIndex = textArray[1];
        if (destinationIndex >= 1 && destinationIndex <= 10) {
            response = `CON Enter your name:`;
            sendResponse(res, response);
        } else {
            response = `END Invalid destination. Please try again.`;
            sendResponse(res, response);
        }
    } else if (textArray.length === 3) {
        const name = textArray[2];
        const destinations = [
            'Kigali-Nyamata',
            'Gicumbi-Nyagatare',
            'Musanze-Rubavu',
            'Kigali-Huye',
            'Rusizi-Nyamasheke',
            'Kigali-Muhanga',
            'Karongi-Rutsiro',
            'Kigali-Rwamagana',
            'Gatsibo-Kayonza',
            'Ngoma-Kirehe'
        ];
        const prices = [
            '1000Rwf',
            '1200Rwf',
            '1500Rwf',
            '2000Rwf',
            '2500Rwf',
            '1000Rwf',
            '1200Rwf',
            '900Rwf',
            '1100Rwf',
            '1300Rwf'
        ];

        const destinationIndex = parseInt(textArray[1]) - 1;
        const destination = destinations[destinationIndex];
        const price = prices[destinationIndex];

        response = `CON Hi ${name}, you have chosen ${destination} at ${price}.
        1. Confirm
        2. Cancel`;
        sendResponse(res, response);
    } else if (textArray.length === 4 && textArray[3] === '1') {
        response = `END Your ticket has been booked successfully.`;
        sendResponse(res, response);
    } else if (textArray.length === 4 && textArray[3] === '2') {
        response = `END Your booking has been canceled.`;
        sendResponse(res, response);
    } else {
        response = `END Invalid input. Please try again.`;
        sendResponse(res, response);
    }

    function sendResponse(res, response) {
        res.set('Content-Type', 'text/plain');
        res.send(response);
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000.');
});
