const express = require('express');
const bodyParser = require('body-parser');
const africastalking = require('./config/africastalking');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const sms = africastalking.SMS;

const sendSMS = async (to, message) => {
    try {
        const response = await sms.send({
            to: [to],
            message: message
        });
        console.log('Message sent successfully:', response);
    } catch (error) {
        console.error('Error sending SMS:', error);
    }
};

app.post('/ussd', async (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";
    const textArray = text.split('*');

    if (text === '') {
        response = `CON Welcome to the Bus Ticketing System!
        1. Buy tickets`;
    } else if (text === '1') {
        response = `CON Choose your destination:
        1. Destination A
        2. Destination B`;
    } else if (textArray.length === 2) {
        const choice = textArray[1];
        if (choice === '1' || choice === '2') {
            response = `CON Enter your name:`;
        } else {
            response = `END Invalid choice. Please try again.`;
        }
    } else if (textArray.length === 3) {
        const name = textArray[2];
        response = `CON Hi ${name}, how many tickets do you want?`;
    } else if (textArray.length === 4) {
        const quantity = textArray[3];
        response = `END You have chosen ${quantity} tickets. Thank you!`;

        // Send an SMS confirmation
        const message = `Your ticket purchase is confirmed. You have bought ${quantity} tickets.`;
        await sendSMS(phoneNumber, message);
    } else {
        response = `END Invalid input. Please try again.`;
    }

    res.set('Content-Type', 'text/plain');
    res.send(response);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
