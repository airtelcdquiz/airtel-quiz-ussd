const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    STARTING_POINT: {
            step: "STARTING_POINT",
            handler: async (session, input) => {
                //On tente de charger les données de l'utilisateur pour savoir s'il est déjà inscrit ou pas
                let userData = null;
                userData = await api.get(`/users/${session.mobileNumber}`).catch(err => {
                    // Sinon, log l'erreur et afficher un message générique à l'utilisateur
                    console.error("Erreur API:", err);
                    return {
                        text: "Une erreur est survenue, veuillez réessayer plus tard.",
                        nextSteps: {
                            "default": "STARTING_POINT"
                        }, // reste sur STARTING_POINT pour attendre la réponse
                        end: true
                    };
                });
                logJson({
                    event: "HOME_HANDLER",
                    userData: userData,
                    sessionId: session.id,
                    mobileNumber: session.mobileNumber
                });
                userData = userData?.data;
                if (userData.exist === true) {
                    session.data.user = userData.user;
                    return {
                        text: `Bienvenue ${userData.user.name} !\n1. Repondre à la question\n2. Verifier mon score\n3. Infos`,
                        nextSteps: {
                            "1": "ANSWER_QUESTION",
                            "2": "CHECK_SCORE",
                            "3": "INFO"
                        },
                        end: false
                    };
                }
                return {
                    text: "Bienvenue sur Airtel Quiz !\n1. S'inscrire\n2. Infos",
                    nextSteps: {
                        "1": "REGISTER",
                        "2": "INFO"
                    },
                    end: false
                };
            }
        }
}