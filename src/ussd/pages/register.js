const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    START_REGISTER: {
            step: "START_REGISTER",
            text: "Pour vous inscrire, veuillez entrer votre nom complet :",
            saveAs: "name",
            nextSteps: {
                "default": "ASK_AGE"
            },
            end: false
        },
    ASK_AGE: {
            step: "ASK_AGE",
            text: "Merci ! Maintenant, veuillez entrer votre âge :",
            saveAs: "age",
            nextSteps: {
                "default": "END"
            },
            end: false
        }
}