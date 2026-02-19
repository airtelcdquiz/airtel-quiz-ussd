const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    ANSWER: {
        step: "ANSWER",
        text: "Vous avez droit à une seul tentative de pour consulter et repondre à la question ! \n1. Continuer\n2. Plus tard",
        nextSteps: {
            "1": "CONTINUE_ANSWER",
            "2": "ANSWER_AFTER"
        },
        end: false
    },
    CONTINUE_ANSWER: {
        step: "CONTINUE_ANSWER",
        handler: async (session, input) => {
            console.log(typeof(session.question_details))
            return {
                step: "CONTINUE_ANSWER",
                text: `${session.question_details.question}\n1. Suivant`,
                nextStep: "QUESTION_OPTIONS",
                end: false
            }
        }
    },
    QUESTION_OPTIONS: {
        step: "QUESTION_OPTIONS",
        handler: async (session, input) => {
            return {
                text: `Options :\n1. ${session.question_details.option_1}\n2. ${session.question_details.option_2}\n3. ${session.question_details.option_3}\n4. ${session.question_details.option_4}`,
                saveAs: 'response',
                nextStep: "QUESTION_ANSWER",
                end: false
            }
        }
    },
    QUESTION_ANSWER: {
        step: "QUESTION_ANSWER",
        handler: async (session, input) => {
            if (session.question_details.response == input) {
                return {
                    step: "QUESTION_ANSWER",
                    text: `Félicitation !! Vous avez fourni la bonne reponse !`,
                    nextStep: "QUESTION_ANSWER",
                    end: true
                }
            } else {
                return {
                    step: "QUESTION_ANSWER",
                    text: `Désolé !! Vous n'avez fourni la bonne reponse`,
                    nextStep: "QUESTION_ANSWER",
                    end: true
                }
            }
        }
    },
    // PAGE D'ACCUEIL
    END_ANSWER: {
        step: "END_ANSWER",
        handler: async (session, input) => {
            return {
                text: "Merci d'avoir participé au quiz !",
                nextStep: "END_APPLICATION",
                url: "http://quiz-user-service:3000/api/answers/dayly",
                end: true
            };
        },
    },
    ANSWER_AFTER: {
        step: "ANSWER_AFTER",
        text: "N'oubliez pas de revenir repondre à la question du jour avan 23:59 !!",
        nextStep: "END_APPLICATION",
        url: "http://quiz-user-service:3000/api/answers/dayly",
        end: true
    }

}