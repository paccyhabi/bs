const db = require('../models'); // Ensure this points to your Sequelize models

const addUssd = async (req, res) => {
    try {
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

            response = `CON Hi ${name}, you have chosen ${selectedRoute.route_name} at ${selectedRoute.fare}Rwf per ticket.
            How many tickets do you want?`;
            sendResponse(res, response);
        } else if (textArray.length === 4) {
            const name = textArray[2];
            const destinationIndex = parseInt(textArray[1]) - 1;
            const quantity = parseInt(textArray[3]);
            const routes = await db.routes.findAll();
            const selectedRoute = routes[destinationIndex];

            if (quantity > 0 && quantity <= selectedRoute.available_seats) {
                const totalAmount = selectedRoute.fare * quantity;
                response = `CON Hi ${name}, you have chosen ${selectedRoute.route_name} at ${selectedRoute.fare}Rwf per ticket.
                Total cost: ${totalAmount}Rwf.
                1. Confirm
                2. Cancel`;
                sendResponse(res, response);
            } else {
                response = `END Invalid quantity or not enough seats available. Please try again.`;
                sendResponse(res, response);
            }
        } else if (textArray.length === 5 && textArray[4] === '1') {
            const name = textArray[2];
            const destinationIndex = parseInt(textArray[1]) - 1;
            const quantity = parseInt(textArray[3]);
            const routes = await db.routes.findAll();
            const selectedRoute = routes[destinationIndex];
            const totalAmount = selectedRoute.fare * quantity;

            // Save the user and ticket details to the database
            const user = await db.users.create({phone_number: phoneNumber, username: name, sessionId, serviceCode});
            await db.tickets.create({
                user_id: user.id,
                route_id: selectedRoute.id,
                quantity,
                amount: totalAmount
            });

            // Update available seats
            await db.routes.update(
                { available_seats: selectedRoute.available_seats - quantity },
                { where: { id: selectedRoute.id } }
            );

            response = `END Your ticket(s) have been booked successfully.`;
            sendResponse(res, response);
        } else if (textArray.length === 5 && textArray[4] === '2') {
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
    } catch (error) {
        console.error('Error handling USSD request:', error);
        res.status(500).send('Internal server error');
    }
};

module.exports = {
    addUssd
};
