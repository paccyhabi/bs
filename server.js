const express = require('express');
const mysql = require('mysql2');
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = mysql.createConnection({
    host: 'bjexna1cudqh5njhcpi7-mysql.services.clever-cloud.com',
    user: 'uug4ww6k5zi36gp1',
    password: 'PhjFkvfh7qF1jnK9gWdQ',
    database: 'bjexna1cudqh5njhcpi7'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the MySQL database');
});

app.get("/api/test", function (req, res) {
    res.send("test request");
});

app.post('/ussd', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;

    let response = '';
    let language = '';
    const textArray = text.split('*');

    if (textArray.length === 1 && textArray[0] === '') {
        response = `CON Welcome to Bus Ticketing System
1. English
2. Kinyarwanda`;
        sendResponse(res, response);
    } else if (textArray.length === 2 && (textArray[0] === '1' || textArray[0] === '2')) {
        language = textArray[0] === '1' ? 'english' : 'kinyarwanda';
        db.query('SELECT * FROM routes', (err, results) => {
            if (err) {
                console.error('Error fetching routes:', err.message);
                response = language === 'english' 
                    ? 'END Error fetching routes. Please try again later.'
                    : 'END Ikosa ryo gufata amakuru. Ongera ugerageze nyuma.';
                sendResponse(res, response);
                return;
            }

            response = language === 'english' ? 'CON Select a route:\n' : 'CON Hitamo urugendo:\n';
            results.forEach((route, index) => {
                response += `${index + 1}. ${route.start_location} to ${route.end_location} - ${route.fare}\n`;
            });
            sendResponse(res, response);
        });
    } else if (textArray.length === 3) {
        const routeIndex = parseInt(textArray[1], 10) - 1;
        db.query('SELECT * FROM routes', (err, results) => {
            if (err || routeIndex >= results.length) {
                response = 'END Invalid route selection. Please try again.';
                sendResponse(res, response);
                return;
            }
            response = textArray[0] === '1' ? 'CON Enter number of tickets:' : 'CON Injiza umubare w\'amatike:';
            sendResponse(res, response);
        });
    } else if (textArray.length === 4) {
        const numberOfTickets = parseInt(textArray[2], 10);
        const routeIndex = parseInt(textArray[1], 10) - 1;

        db.query('SELECT * FROM routes', (err, results) => {
            if (err || routeIndex >= results.length) {
                response = 'END Invalid route selection. Please try again.';
                sendResponse(res, response);
                return;
            }
            const selectedRoute = results[routeIndex];
            if (selectedRoute.available_seats < numberOfTickets) {
                response = textArray[0] === '1'
                    ? 'END Not enough available seats.'
                    : 'END Ntabwo dufite amatike ahagije.';
                sendResponse(res, response);
                return;
            }
            response = textArray[0] === '1' ? 'CON Enter your name:' : 'CON Injiza izina ryawe:';
            sendResponse(res, response);
        });
    } else if (textArray.length === 5) {
        const numberOfTickets = parseInt(textArray[2], 10);
        const routeIndex = parseInt(textArray[1], 10) - 1;
        const userName = textArray[4];

        db.query('SELECT * FROM routes', (err, results) => {
            if (err || routeIndex >= results.length) {
                response = 'END Invalid route selection. Please try again.';
                sendResponse(res, response);
                return;
            }

            const selectedRoute = results[routeIndex];
            const totalFare = selectedRoute.fare * numberOfTickets;

            response = textArray[0] === '1'
                ? `CON Ticket Information:\nRoute: ${selectedRoute.start_location} to ${selectedRoute.end_location}\nTickets: ${numberOfTickets}\nTotal Fare: ${totalFare}\nName: ${userName}\n1. Confirm\n2. Cancel`
                : `CON Amakuru y'amatike:\nUrugendo: ${selectedRoute.start_location} to ${selectedRoute.end_location}\nAmatike: ${numberOfTickets}\nIgiciro cyose: ${totalFare}\nIzina: ${userName}\n1. Emeza\n2. Gahunda`;
            sendResponse(res, response);
        });
    } else if (textArray.length === 6 && textArray[5] === '1') {
        const numberOfTickets = parseInt(textArray[2], 10);
        const routeIndex = parseInt(textArray[1], 10) - 1;
        const userName = textArray[4];

        db.query('SELECT * FROM routes', (err, results) => {
            if (err || routeIndex >= results.length) {
                response = 'END Invalid route selection. Please try again.';
                sendResponse(res, response);
                return;
            }

            const selectedRoute = results[routeIndex];
            db.query(
                'UPDATE routes SET available_seats = available_seats - ? WHERE id = ?',
                [numberOfTickets, selectedRoute.id],
                (err) => {
                    if (err) {
                        console.error('Error updating seats:', err.message);
                        response = textArray[0] === '1'
                            ? 'END Error processing purchase. Please try again later.'
                            : 'END Ikosa ryo kugura amatike. Ongera ugerageze nyuma.';
                        sendResponse(res, response);
                        return;
                    }
                    db.query(
                        'INSERT INTO tickets (user_id, route_id, number_of_tickets, total_fare, user_name) VALUES (?, ?, ?, ?, ?)',
                        [phoneNumber, selectedRoute.id, numberOfTickets, selectedRoute.fare * numberOfTickets, userName],
                        (err) => {
                            if (err) {
                                console.error('Error saving ticket:', err.message);
                                response = textArray[0] === '1'
                                    ? 'END Error processing purchase. Please try again later.'
                                    : 'END Ikosa ryo kugura amatike. Ongera ugerageze nyuma.';
                                sendResponse(res, response);
                                return;
                            }
                            response = textArray[0] === '1'
                                ? `END Ticket purchase confirmed. You have purchased ${numberOfTickets} tickets for ${selectedRoute.start_location} to ${selectedRoute.end_location}.`
                                : `END Kugura itike byemejwe. Uguze amatike ${numberOfTickets} y'urugendo ${selectedRoute.start_location} to ${selectedRoute.end_location}.`;
                            sendResponse(res, response);
                        }
                    );
                }
            );
        });
    } else {
        response = 'END Invalid option.';
        sendResponse(res, response);
    }

    function sendResponse(res, response) {
        res.set('Content-Type', 'text/plain');
        res.send(response);
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`USSD server listening on http://localhost:${PORT}`));
