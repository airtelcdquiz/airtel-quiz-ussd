const { text } = require("express");
const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

module.exports = {

    // PAGE D'ACCUEIL
    START_REGISTER: {
            step: "START_REGISTER",
            text: "Veuillez entrer votre nom complet :",
            saveAs: "name",
            nextStep:  "SCHOOL_CODE" ,
            end: false
        },
    SCHOOL_CODE: {
            step: "SCHOOL_CODE",
            text: "Veuillez entrer le code de votre école :",
            saveAs: "school_code",
            nextStep: "SCHOOL_LEVEL",
            end: false
    },
    SCHOOL_LEVEL:{
            handler: async (session, input)=>{
                logJson({
                    message: "Try to get school infos"
                })
                try{
                    const school_result = await api.get(`http://quiz-user-service:3000/api/schools/${input}`);
                    logJson({
                        message: "School Inquiry result",
                        school_result: school_result.data
                    })
                }catch(e){
                    logError(e, {
                        message: "School Inquiry Error"
                    })
                    return {
                        step: "SCHOOL_CODE",
                        text: "Code ecole incorrect !!\n\nVeuillez entrer le code de votre école :",
                        saveAs: "school_code",
                        nextStep: "SCHOOL_LEVEL",
                        end: false
                    };
                }
                logJson({
                    input
                })
                return {
                    step: "SCHOOL_LEVEL",
                    text: "Votre niveau :\n1. Education de base\n2. Humanite", 
                    nextSteps: {
                        "1": "SCHOOL_LEVEL_BASIC", 
                        "2": "SCHOOL_LEVEL_HUMANITY"
                    },
                    saveAs: "school_level",
                    end: false
                };
            },
            end: false
    },
    SCHOOL_LEVEL_BASIC: {
        step: "SCHOOL_LEVEL_BASIC",
        text: "Veillez donner votre classe : \n1. 1ère année\n2. 2ème année\n3. 3ème année\n4. 4ème année\n5. 5ème année\n6. 6ème année\n7. 7ème année\n8. 8ème année",
        nextStep: "END_REGISTER",
        saveAs: "school_class",
        end: false
    }, 
    SCHOOL_LEVEL_HUMANITY: {
        step: "SCHOOL_LEVEL_HUMANITY",
        text: "Votre option : \n1. Littéraire\n2. Commercial\n3. Math-Physique\n4. Scientifique",
        nextStep: "SCHOOL_LEVEL_HUMANITY_CLASS",
        saveAs: "school_option",
        end: false
    },
    SCHOOL_LEVEL_HUMANITY_CLASS:{
        step: "SCHOOL_LEVEL_HUMANITY_CLASS",
        text: "Votre classe : \n1. 1ère année\n2. 2ème année\n3. 3ème année\n4. 4ème année",
        nextStep: "END_REGISTER",
        saveAs: "school_class",
        end: false
    },  
    END_REGISTER: {
            step: "END_REGISTER",
            text: "Merci ! Vos données sont envoyées et en cours d'examen.",
            nextStep: "END_REGISTER",
            url: "http://quiz-user-service:3000/api/users/",
            end: true
        }
}