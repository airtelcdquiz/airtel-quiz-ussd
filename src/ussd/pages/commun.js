const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");
const { END_REGISTER } = require("./register");

module.exports = {

    // PAGE D'ACCUEIL
    END_APPLICATION: {
        step: "END_APPLICATION",
        text: "Merci !",
        nextStep: "END_APPLICATION",
        end: true
    },
}