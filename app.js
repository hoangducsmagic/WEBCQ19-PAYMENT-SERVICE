const express = require("express");
const path = require("path");


// Start express app
const app = express();

app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);

// Routers


module.exports = app;
