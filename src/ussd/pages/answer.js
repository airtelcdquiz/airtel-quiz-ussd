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
            try{
                api.post(`http://quiz-user-service:3000/api/users/${session.mobileNumber}/lock-daily-question`, {})
            }catch(e){}
            return {
                step: "CONTINUE_ANSWER",
                text: `${session.data.user.question_details.question}\n1. Suivant`,
                nextStep: "QUESTION_OPTIONS",
                end: false
            }
        }
    },
    QUESTION_OPTIONS: {
        step: "QUESTION_OPTIONS",
        handler: async (session, input) => {
            return {
                text: `Options :\n1. ${session.data.user.question_details.option_1}\n2. ${session.data.user.question_details.option_2}\n3. ${session.data.user.question_details.option_3}\n4. ${session.data.user.question_details.option_4}`,
                saveAs: 'response',
                nextStep: "QUESTION_ANSWER",
                end: false
            }
        }
    },
    QUESTION_ANSWER: {
        step: "QUESTION_ANSWER",
        handler: async (session, input) => {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
            if (session.data.user.question_details.response == input) {
                try{
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})

                    api.post(`http://quiz-user-service:3000/api/users/${session.mobileNumber}/submit-answer`, {
                        choice: input
                    }).then(result => {
                        logJson(result.data)
                    }).catch(error => {
                        logError(error, {
                            "message": "Erreur lors de la tentative de transmission de la valuer de la reponse"
                        })
                    })
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})

                }catch(e){  

                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})
                    logJson({"e":"Nous avons une erreur !!!!"})
                
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"})
                    logJson({"e":"############################################"});

                }
                return {
                    step: "QUESTION_ANSWER",
                    text: `Félicitation !! Vous avez fourni la bonne reponse !`,
                    nextStep: "END_ANSWER",
                    // url: "http://quiz-user-service:3000/api/answers/dayly",
                    end: true
                }
            } else {
                return {
                    step: "QUESTION_ANSWER",
                    text: `Désolé !! Vous n'avez fourni la bonne reponse !`,
                    nextStep: "END_ANSWER",
                    // url: "http://quiz-user-service:3000/api/answers/dayly",
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
                // url: "http://quiz-user-service:3000/api/answers/dayly",
                end: true
            };
        },
    },
    ANSWER_AFTER: {
        step: "ANSWER_AFTER",
        text: "N'oubliez pas de revenir repondre à la question du jour avant 23:59 !!",
        nextStep: "END_APPLICATION",
        // url: "http://quiz-user-service:3000/api/answers/dayly",
        end: true
    }

}