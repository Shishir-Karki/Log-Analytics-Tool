const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const logRoutes = require('./routes/logs');

dotenv.config();
connectDB();

const app = express();

app.use(bodyParser.json());
app.use('/api/logs', logRoutes);

module.exports = app;
