const { api } = require("../../utils/api");
const { logJson, logError } = require("../../utils/logger");

// Codes saisis a l'inscription. Garder synchronise avec airtel_zbm_api
// (utils/labels.py), qui affiche ces codes dans le dashboard.
const LEVEL_MENU = "Votre niveau :\n1. Education de base\n2. Humanité";
const BASIC_CLASS_MENU = "Veuillez donner votre classe : \n1. 1ère année\n2. 2ème année\n3. 3ème année\n4. 4ème année\n5. 5ème année\n6. 6ème année\n7. 7ème année\n8. 8ème année";
const OPTION_MENU = "Votre option : \n1. Littéraire\n2. Commercial\n3. Math-Physique\n4. Scientifique\n5. Électronique\n6. Électricité\n7. Mécanique";
const HUMANITY_CLASS_MENU = "Votre classe : \n1. 1ère année\n2. 2ème année\n3. 3ème année\n4. 4ème année";

const INVALID = "Choix invalide.\n";
const MAX_BASIC_CLASS = 8;
const MAX_HUMANITY_CLASS = 4;
const MAX_OPTION = 7;

// Vrai si `value` est un entier entre 1 et max.
const inRange = (value, max) => {
    const v = String(value || "").trim();
    if (!/^\d{1,2}$/.test(v)) return false;
    const n = parseInt(v, 10);
    return n >= 1 && n <= max;
};

const askLevel = (prefix = "") => ({
    step: "SCHOOL_LEVEL",
    text: prefix + LEVEL_MENU,
    nextSteps: { "1": "SCHOOL_LEVEL_BASIC", "2": "SCHOOL_LEVEL_HUMANITY" },
    invalidStep: "SCHOOL_LEVEL_RETRY", // tout autre choix : on redemande
    saveAs: "school_level",
    end: false
});

const askSchoolCode = (prefix = "") => ({
    step: "SCHOOL_CODE",
    text: prefix + "Veuillez entrer le code de votre école :",
    saveAs: "school_code",
    nextStep: "SCHOOL_LEVEL",
    end: false
});

const unavailable = {
    step: "END_REGISTER",
    text: "Service momentanément indisponible. Merci de réessayer plus tard.",
    end: true
};

async function findSchool(code) {
    const res = await api.get(`http://quiz-user-service:3000/api/schools/${encodeURIComponent(code)}`);
    return res.data && res.data.exist === true ? res.data : null;
}

// Chaque handler recoit la saisie de l'ecran precedent : il la verifie et,
// si elle est invalide, reaffiche cet ecran avec "Choix invalide".
module.exports = {

    START_REGISTER: {
        step: "START_REGISTER",
        text: "Veuillez entrer votre nom complet :",
        saveAs: "name",
        nextStep: "SCHOOL_CODE",
        end: false
    },

    // Saisie recue : le nom.
    SCHOOL_CODE: {
        step: "SCHOOL_CODE",
        handler: async (session, input) => {
            session.data = session.data || {};
            const name = String(input || "").replace(/\s+/g, " ").trim();
            if (name.length < 3 || !/\p{L}/u.test(name)) {
                return {
                    step: "START_REGISTER",
                    text: "Nom invalide.\nVeuillez entrer votre nom complet :",
                    saveAs: "name",
                    nextStep: "SCHOOL_CODE",
                    end: false
                };
            }
            session.data.name = name;
            return askSchoolCode();
        }
    },

    // Saisie recue : le code ecole (insensible a la casse).
    SCHOOL_LEVEL: {
        step: "SCHOOL_LEVEL",
        handler: async (session, input) => {
            session.data = session.data || {};
            const raw = String(input || "").trim();
            const code = raw.toUpperCase();
            try {
                let school = code ? await findSchool(code) : null;
                if (!school && raw && raw !== code) school = await findSchool(raw);
                if (!school) return askSchoolCode("Code école incorrect.\n");
                session.data.school_code = school.code || code;
                logJson({ event: "REGISTER_SCHOOL_OK", school_code: session.data.school_code });
                return askLevel();
            } catch (e) {
                logError(e, { message: "School Inquiry Error" });
                return unavailable;
            }
        }
    },

    // Niveau hors menu.
    SCHOOL_LEVEL_RETRY: {
        step: "SCHOOL_LEVEL_RETRY",
        handler: async () => askLevel(INVALID)
    },

    // Saisie recue : niveau 1.
    SCHOOL_LEVEL_BASIC: {
        step: "SCHOOL_LEVEL_BASIC",
        handler: async (session) => {
            session.data.school_level = "1";
            delete session.data.school_option; // pas d'option en education de base
            return {
                step: "SCHOOL_LEVEL_BASIC",
                text: BASIC_CLASS_MENU,
                saveAs: "school_class",
                nextStep: "END_REGISTER",
                end: false
            };
        }
    },

    // Saisie recue : niveau 2.
    SCHOOL_LEVEL_HUMANITY: {
        step: "SCHOOL_LEVEL_HUMANITY",
        handler: async (session) => {
            session.data.school_level = "2";
            return {
                step: "SCHOOL_LEVEL_HUMANITY",
                text: OPTION_MENU,
                saveAs: "school_option",
                nextStep: "SCHOOL_LEVEL_HUMANITY_CLASS",
                end: false
            };
        }
    },

    // Saisie recue : l'option.
    SCHOOL_LEVEL_HUMANITY_CLASS: {
        step: "SCHOOL_LEVEL_HUMANITY_CLASS",
        handler: async (session, input) => {
            if (!inRange(input, MAX_OPTION)) {
                return {
                    step: "SCHOOL_LEVEL_HUMANITY",
                    text: INVALID + OPTION_MENU,
                    saveAs: "school_option",
                    nextStep: "SCHOOL_LEVEL_HUMANITY_CLASS",
                    end: false
                };
            }
            session.data.school_option = String(parseInt(input, 10));
            return {
                step: "SCHOOL_LEVEL_HUMANITY_CLASS",
                text: HUMANITY_CLASS_MENU,
                saveAs: "school_class",
                nextStep: "END_REGISTER",
                end: false
            };
        }
    },

    // Saisie recue : la classe. Envoie l'inscription si elle est valide.
    END_REGISTER: {
        step: "END_REGISTER",
        handler: async (session, input) => {
            const humanity = session.data.school_level === "2";
            const max = humanity ? MAX_HUMANITY_CLASS : MAX_BASIC_CLASS;
            if (!inRange(input, max)) {
                return {
                    step: humanity ? "SCHOOL_LEVEL_HUMANITY_CLASS" : "SCHOOL_LEVEL_BASIC",
                    text: INVALID + (humanity ? HUMANITY_CLASS_MENU : BASIC_CLASS_MENU),
                    saveAs: "school_class",
                    nextStep: "END_REGISTER",
                    end: false
                };
            }
            session.data.school_class = String(parseInt(input, 10));
            return {
                step: "END_REGISTER",
                text: "Merci ! Vos données sont envoyées et en cours d'examen.",
                url: "http://quiz-user-service:3000/api/users/",
                end: true
            };
        }
    }
};
