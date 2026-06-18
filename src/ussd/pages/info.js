const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    INFO: {
        step: "INFO",
        text: "Airtel Quiz est un jeu de quiz interactif accessible via USSD, conçu pour les étudiants\n1. Me désabonner",
        nextSteps: {
            "1": "UNSUSCRIBE",
            "2": "END_APPLICATION"
        },
        end: false
    },
    UNSUSCRIBE: {
        step: "UNSUSCRIBE",
        text: "Vous êtes sur le point de vous désabonner de Airtel Quiz. \nVous perdre tous vos points actuels\n1. Non\n. Oui, me désabonner ",
        nextSteps: {
            "1": "END_APPLICATION",
            "2": "UNSUSCRIBE_APPLY"
        },
        end: false
    },
    UNSUSCRIBE_APPLY: {
        step: "UNSUSCRIBE_APPLY",
        handler: async (session, input) => {
            return {
                text: "Vous êtes désabonné !\nVous pouvez vous reinscrire à tout moment en faisant *4405#\n\n- Airtel Quiz -",
                nextSteps: {
                    "1": "END_APPLICATION",
                    "2": "UNSUSCRIBE_APPLY"
                },
                end: true
            }
        }

    }

}