// src/bootstrap/app.js
// Responsabilité : configurer Express (middlewares + routes).

const express = require("express");
const ussdRoute = require("../http/routes/ussd.route");
const xmlOnly = require("../http/middlewares/xmlOnly.middleware");

const app = express();

// parse XML brut
app.use(express.text({ type: ["text/xml", "application/xml"] }));

// sécurité : XML only
app.use(xmlOnly);

// route USSD
app.use("/ussd", ussdRoute);

module.exports = app;
