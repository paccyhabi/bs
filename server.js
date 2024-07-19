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
    } 
        res.send(response);

  });
  

app.listen(3000, () => {
  console.log('Server is running on port 3000.');
});
