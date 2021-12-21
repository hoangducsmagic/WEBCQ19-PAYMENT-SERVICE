const express = require("express");
const path = require("path");
const globalErrorHandler = require('./middlewares/globalErrorHandler');
const paymentRouter=require('./routes/paymentRoutes')
const accountRouter=require('./routes/accountRoutes')

// Start express app
const app = express();

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// Routers
app.use('/payment',paymentRouter);
app.use('/account', accountRouter);


app.use(globalErrorHandler);

module.exports = app;
