//create express app import express and mongoose and connect to mongodb
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
require('dotenv').config();


//connect to mongodb
mongoose.connect(`mongodb+srv://${process.env.DBNAME}:${process.env.PASSWORD}@cluster0.vbsad.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    console.log('Connected to database');
}).catch((err) => {
    console.log('Error: ', err.message);
    console.log('Connection failed');
});


//middleware
app.use(express.json());
app.use(cors());


//import routes
const authRoute = require('./routes/auth');
const leadRoute = require('./routes/lead');
const jobRoute = require('./routes/job');


//use routes
app.use('/api/auth', authRoute);
app.use('/api/lead', leadRoute);
app.use('/api/job', jobRoute);


//listen to port
app.listen(5000, () => {
    console.log('server is running on port 5000');
}
);
