const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/ussd', async (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = '';
    const textArray = text.split('*');

    // Step 1: Language selection
    if (textArray.length === 1 && textArray[0] === '') {
        response = `CON Welcome to Bus Ticketing System
1. English
2. Kinyarwanda`;
    } else if (textArray.length === 2 && (textArray[0] === '1' || textArray[0] === '2')) {
        const language = textArray[0] === '1' ? 'en' : 'rw';

        // Step 2: Display list of routes
        try {
            const routes = await db.routes.findAll();
            response = language === 'en' ? 'CON Select a route:\n' : 'CON Hitamo urugendo:\n';
            routes.forEach((route, index) => {
                response += `${index + 1}. ${route.start_location} to ${route.end_location} - ${route.fare}\n`;
            });
        } catch (error) {
            console.error('Error fetching routes:', error);
            response = language === 'en' ? 'END Error fetching routes. Please try again later.' : 'END Ikosa ryo gufata amakuru. Ongera ugerageze nyuma.';
        }
    } else if (textArray.length === 3) {
        const language = textArray[0] === '1' ? 'en' : 'rw';

        // Step 3: Allow user to select route
        response = language === 'en' ? 'CON Enter number of tickets:' : 'CON Injiza umubare w\'amatike:';
    } else if (textArray.length === 4) {
        const language = textArray[0] === '1' ? 'en' : 'rw';
        const routeIndex = parseInt(textArray[2], 10) - 1;
        const numberOfTickets = parseInt(textArray[3], 10);

        // Step 4: Ask number of tickets
        try {
            const routes = await db.routes.findAll();
            const selectedRoute = routes[routeIndex];

            // Step 5: Remove number of tickets from available seats
            if (selectedRoute.available_seats < numberOfTickets) {
                response = language === 'en' ? 'END Not enough available seats.' : 'END Ntabwo dufite amatike ahagije.';
            } else {
                // Step 6: Prompt for name
                response = language === 'en' ? 'CON Enter your name:' : 'CON Injiza izina ryawe:';
            }
        } catch (error) {
            console.error('Error fetching route:', error);
            response = language === 'en' ? 'END Error processing request. Please try again later.' : 'END Ikosa ryo gutunganya amakuru. Ongera ugerageze nyuma.';
        }
    } else if (textArray.length === 5) {
        const language = textArray[0] === '1' ? 'en' : 'rw';
        const routeIndex = parseInt(textArray[2], 10) - 1;
        const numberOfTickets = parseInt(textArray[3], 10);
        const userName = textArray[4];

        try {
            const routes = await db.routes.findAll();
            const selectedRoute = routes[routeIndex];
            const totalFare = selectedRoute.fare * numberOfTickets;

            // Step 7: Display ticket information
            response = language === 'en' ?
                `CON Ticket Information:\nRoute: ${selectedRoute.start_location} to ${selectedRoute.end_location}\nTickets: ${numberOfTickets}\nTotal Fare: ${totalFare}\nName: ${userName}\n1. Confirm\n2. Cancel` :
                `CON Amakuru y'amatike:\nUrugendo: ${selectedRoute.start_location} to ${selectedRoute.end_location}\nAmatike: ${numberOfTickets}\nIgiciro cyose: ${totalFare}\nIzina: ${userName}\n1. Emeza\n2. Gahunda`;
        } catch (error) {
            console.error('Error fetching route:', error);
            response = language === 'en' ? 'END Error processing request. Please try again later.' : 'END Ikosa ryo gutunganya amakuru. Ongera ugerageze nyuma.';
        }
    } else if (textArray.length === 6 && textArray[5] === '1') {
        const language = textArray[0] === '1' ? 'en' : 'rw';
        const routeIndex = parseInt(textArray[2], 10) - 1;
        const numberOfTickets = parseInt(textArray[3], 10);
        const userName = textArray[4];

        try {
            const routes = await db.routes.findAll();
            const selectedRoute = routes[routeIndex];

            await db.routes.update(
                { available_seats: selectedRoute.available_seats - numberOfTickets },
                { where: { id: selectedRoute.id } }
            );
            await db.tickets.create({
                user_id: phoneNumber,
                route_id: selectedRoute.id,
                number_of_tickets: numberOfTickets,
                total_fare: selectedRoute.fare * numberOfTickets,
                user_name: userName
            });

            // Step 8: Confirm
            response = language === 'en' ? `END Ticket purchase confirmed. You have purchased ${numberOfTickets} tickets for ${selectedRoute.start_location} to ${selectedRoute.end_location}.` :
                `END Kugura itike byemejwe. Uguze amatike ${numberOfTickets} y'urugendo ${selectedRoute.start_location} to ${selectedRoute.end_location}.`;
        } catch (error) {
            console.error('Error saving ticket:', error);
            response = language === 'en' ? 'END Error processing purchase. Please try again later.' : 'END Ikosa ryo kugura amatike. Ongera ugerageze nyuma.';
        }
    } else {
        response = 'END Invalid option.';
    }

    res.send(response);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000.');
});
