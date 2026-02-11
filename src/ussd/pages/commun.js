const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    START_REGISTER: {
            step: "START_REGISTER",
            text: "Pour vous inscrire, veuillez entrer votre nom complet :",
            saveAs: "name",
            nextStep:  "ASK_AGE" ,
            end: false
        },
}