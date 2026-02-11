const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    INFO: {
        step: "INFO",
        text: "Airtel Quiz est un jeu de quiz interactif accessible via USSD, conçu pour les étudiants ", 
        nextStep:  "END_APPLICATION" ,
        end: false
    },

}