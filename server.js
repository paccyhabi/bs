const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models'); // Ensure this points to your Sequelize models
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/ussd', async (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = "";
    const textArray = text.split('*');

    if (text === '') {
        response = `CON Welcome to the Bus Ticketing System!
        1. Buy tickets`;
        sendResponse(res, response);
    } else if (text === '1') {
        const routes = await db.routes.findAll();
        let routesMenu = 'CON Our destinations:\n';
        routes.forEach((route, index) => {
            routesMenu += `${index + 1}. ${route.route_name} ${route.fare}Rwf\n`;
        });
        sendResponse(res, routesMenu);
    } else if (textArray.length === 2) {
        const destinationIndex = parseInt(textArray[1]) - 1;
        const routes = await db.routes.findAll();
        if (destinationIndex >= 0 && destinationIndex < routes.length) {
            response = `CON Enter your name:`;
            sendResponse(res, response);
        } else {
            response = `END Invalid destination. Please try again.`;
            sendResponse(res, response);
        }
    } else if (textArray.length === 3) {
        const name = textArray[2];
        const destinationIndex = parseInt(textArray[1]) - 1;
        const routes = await db.routes.findAll();
        const selectedRoute = routes[destinationIndex];

        response = `CON Hi ${name}, you have chosen ${selectedRoute.route_name} at ${selectedRoute.fare}Rwf.
        1. Confirm
        2. Cancel`;
        sendResponse(res, response);
    } else if (textArray.length === 4 && textArray[3] === '1') {
        const name = textArray[2];
        const destinationIndex = parseInt(textArray[1]) - 1;
        const routes = await db.routes.findAll();
        const selectedRoute = routes[destinationIndex];

        // Save the user and ticket details to the database
        const [user, created] = await db.users.findOrCreate({
            where: { phone_number: phoneNumber },
            defaults: { username: name }
        });

        await db.tickets.create({ user_id: user.id, route_id: selectedRoute.id, quantity: 1 });

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
