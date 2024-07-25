const express = require('express')
const bodyParser = require('body-parser');
const app = express()
//midleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//routers
const router = require('./routes/userRoutes.js')
app.use('/', router)


//testing api
app.get('/', (req, res) => {
    res.json({message:'hello from api'})
})


//port
const PORT = process.env.PORT || 3000


//server
app.listen(PORT, ()=> {
    console.log('server is running on port', PORT)
})