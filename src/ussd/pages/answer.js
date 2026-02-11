const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    ANSWER: {
        step: "ANSWER",
        text: "Repondre à la question :",
        saveAs: "response",
        nextStep:  "END_ANSWER" ,
        end: false
    },
     // PAGE D'ACCUEIL
    END_ANSWER: {
        step: "END_ANSWER",
        handler: async (session, input) => {
            // Enregistrer la réponse de l'utilisateur
            session.data.response = input.trim();
            if (!session.data.response || session.data.response < 0 || session.data.response > 4) {
                return {
                    text: "Aucune réponse saisie ou réponse invalide. Veuillez réessayer.",
                    nextStep: "ANSWER",
                    end: false
                };
            }
            return { 
                text: "Merci d'avoir participé au quiz ! Votre réponse a été enregistrée.", 
                nextStep: "END_APPLICATION",
                url:"http://quiz-user-service:3000/api/answers/dayly",
                end: true 
            };
        },
    },

}