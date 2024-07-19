// server.js
const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');

const app = express();
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.send('Hello World!');
})

// server.js (add USSD route)
app.post('/', (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
  
    // Parse USSD request and respond
    let response = '';
  
    if (text == '') {
      response = `CON Welcome to Bus Ticketing System
      1. View Routes
      2. Buy Ticket`;
    } else if (text == '1') {
      // Fetch routes from the database
      db.routes.findAll().then(routes => {
        response = 'CON Select a route:\n';
        routes.forEach((route, index) => {
          response += `${index + 1}. ${route.start_location} to ${route.end_location} - ${route.fare}\n`;
        });
        res.send(response);
      });
    } else if (text.startsWith('2')) {
      // Buying a ticket logic
      const routeIndex = parseInt(text.split('*')[1], 10) - 1;
      db.routes.findAll().then(routes => {
        const selectedRoute = routes[routeIndex];
        if (selectedRoute.available_seats > 0) {
          // Deduct a seat and create a ticket
          db.routes.update(
            { available_seats: selectedRoute.available_seats - 1 },
            { where: { id: selectedRoute.id } }
          );
          db.tickets.create({
            user_id: phoneNumber, // Assuming user is identified by phone number
            route_id: selectedRoute.id
          });
          response = `END Ticket purchased for ${selectedRoute.start_location} to ${selectedRoute.end_location}.`;
        } else {
          response = 'END No available seats for this route.';
        }
        res.send(response);
      });
    }
  });
  

app.listen(3000, () => {
  console.log('Server is running on port 3000.');
});
