const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    CHECK_SCORE: {
        step: "CHECK_SCORE",
        text: "Votre scrore est en cours de calcul. Il vous sera envoyé par SMS", 
        nextStep:  "END_APPLICATION" ,
        url: "http://quiz-user-service:3000/api/scores",
        end: true
    },

}