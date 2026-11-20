// Menus du TV Show (quiz en direct).
// Toute la logique du jeu est dans le service tvshow ; ces pages ne font qu'afficher
// son état et lui transmettre l'inscription et les réponses.
// Textes sans « ê », « ç », « î », « ô » : ces lettres passent mal sur certains téléphones.
const { api } = require("../../utils/api");
const { logError } = require("../../utils/logger");

const TV_URL = process.env.TVSHOW_INTERNAL_URL || "http://tvshow:3000/tv/internal";
const TIMEOUT = 2000;

const tv = {
    /** État du joueur, ou null si le service ne répond pas (le menu habituel s'affiche alors). */
    async state(phone) {
        try {
            return (await api.get(`${TV_URL}/players/${phone}/state`, { timeout: TIMEOUT })).data;
        } catch (err) {
            logError(err, { stage: "TVSHOW_STATE", mobileNumber: phone });
            return null;
        }
    },
    async register(phone, code) {
        return (await api.post(`${TV_URL}/register`, { phone, code }, { timeout: TIMEOUT })).data;
    },
    async answer(phone, questionId, choice) {
        return (await api.post(`${TV_URL}/answer`, { phone, question_id: questionId, choice }, { timeout: TIMEOUT })).data;
    },
};

const REFRESH = { "1": "TV_LIVE" };
const seconds = ms => (Math.round((ms || 0) / 100) / 10).toString().replace(".", ",");
const pts = n => `${n || 0} pt${(n || 0) > 1 ? "s" : ""}`;

function fmtDate(iso) {
    if (!iso) return "";
    return new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Africa/Kinshasa", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso)).replace(" ", " a ");
}

/** Écran d'attente / résultat avec « 1. Actualiser » : la session USSD reste ouverte. */
function waitScreen(text) {
    return { text: `${text}\n1. Actualiser`, nextSteps: REFRESH, invalidStep: "TV_LIVE", end: false };
}

function resultText(result, r) {
    switch (result) {
        case "winner":
            return `Bonne reponse ! 1er en ${seconds(r.elapsed_ms)} s.\nTotal : ${pts(r.points)}`;
        case "correct_late":
            return `Bonne reponse, mais ${r.winner_name || "un autre joueur"} a ete plus rapide.\nTotal : ${pts(r.points)}`;
        case "wrong":
            return `Mauvaise reponse.\nAttendez la question suivante.\nTotal : ${pts(r.points)}`;
        case "too_late":
            return r.winner_name
                ? `Trop tard : ${r.winner_name} a trouve en premier.\nTotal : ${pts(r.points)}`
                : `Trop tard, la question est terminee.\nTotal : ${pts(r.points)}`;
        case "already_answered":
            return `Vous avez deja repondu a cette question.\nTotal : ${pts(r.points)}`;
        default:
            return null;
    }
}

/** Affiche ce que le joueur doit voir pendant le direct. */
function renderLive(session, st) {
    const title = st.session?.title || "TV Show";
    if (st.phase === "paused") return waitScreen(`TV Show en pause.\nOn revient tout de suite !\nScore : ${pts(st.points)}`);

    if (st.phase === "question" && st.question) {
        const qn = st.question;
        if (st.answered) {
            return waitScreen(resultText(st.answered.result, { ...st.answered, points: st.points, winner_name: null }) || "Reponse enregistree.");
        }
        // La question vue est mémorisée : la réponse sera rattachée à CETTE question.
        session.data = session.data || {};
        session.data.tv_q = { id: qn.id, position: qn.position, total: qn.total, options: qn.options };
        return {
            text: `TV Show - Q${qn.position}/${qn.total}\n${qn.question}\n1. Voir les options`,
            nextSteps: { "1": "TV_OPTIONS" },
            invalidStep: "TV_LIVE",
            end: false,
        };
    }

    if (st.phase === "closed" && st.last) {
        const l = st.last;
        let head;
        if (l.your_result === "winner") head = `Bravo ! Vous avez gagne la Q${l.position}.`;
        else head = `Q${l.position} terminee.\n` + (l.winner_name ? `Gagnant : ${l.winner_name}` : "Personne n'a trouve.");
        return waitScreen(`${head}\nBonne reponse : ${l.correct_option}\nScore : ${pts(st.points)}`);
    }

    return waitScreen(`TV Show "${title}"\nLa prochaine question arrive. Regardez la tele !\nScore : ${pts(st.points)}`);
}

function renderEnded(st) {
    const rank = st.rank ? `Vous etes ${st.rank === 1 ? "1er" : st.rank + "e"} sur ${st.total} avec ${pts(st.points)}.` : "";
    return { text: `TV Show "${st.session?.title || ""}" termine.\n${rank}\nMerci d'avoir joue !`, end: true };
}

module.exports = {
    tv,
    renderLive,

    // Entrée « 9. TV Show » du menu habituel (hors direct).
    TV_MENU: {
        step: "TV_MENU",
        handler: async (session) => {
            const st = await tv.state(session.mobileNumber);
            if (!st) return { text: "Le TV Show est momentanement indisponible. Reessayez plus tard.", end: true };
            if (st.mode === "live") return renderLive(session, st);
            if (st.mode === "ended") return renderEnded(st);
            if (st.mode === "upcoming") {
                const when = fmtDate(st.session.scheduled_at);
                const text = `TV Show "${st.session.title}"\nVous etes inscrit.${when ? `\nDebut le ${when}.` : ""}`;
                if (st.registration_open) {
                    return { text: `${text}\n1. Autre code de session\n0. Retour`, nextSteps: { "1": "TV_CODE", "0": "HOME" }, invalidStep: "TV_MENU", end: false };
                }
                return { text: `${text}\nA bientot !`, end: true };
            }
            if (st.registration_open) {
                return { text: "TV Show\nEntrez le code de la session (4 chiffres) :", nextStep: "TV_REGISTER", end: false };
            }
            return { text: "Aucun TV Show ouvert aux inscriptions pour le moment.", end: true };
        },
    },

    TV_CODE: {
        step: "TV_CODE",
        text: "Entrez le code de la session (4 chiffres) :",
        nextStep: "TV_REGISTER",
        end: false,
    },

    TV_REGISTER: {
        step: "TV_REGISTER",
        handler: async (session, input) => {
            const code = String(input || "").replace(/\D/g, "");
            if (code.length !== 4) {
                return { text: "Le code fait 4 chiffres.\nEntrez le code de la session :", nextStep: "TV_REGISTER", end: false };
            }
            let r;
            try {
                r = await tv.register(session.mobileNumber, code);
            } catch (err) {
                logError(err, { stage: "TVSHOW_REGISTER", sessionId: session.id });
                return { text: "Inscription momentanement indisponible. Reessayez plus tard.", end: true };
            }
            const title = r.session?.title ? `"${r.session.title}"` : "";
            switch (r.result) {
                case "ok": {
                    const when = fmtDate(r.session?.scheduled_at);
                    return { text: `Inscription confirmee au TV Show ${title}${when ? `, le ${when}` : ""}.\nUn SMS de confirmation vous est envoye.`, end: true };
                }
                case "already":
                    return { text: `Vous etes deja inscrit au TV Show ${title}.`, end: true };
                case "unknown_code":
                    return { text: "Code inconnu.\nEntrez le code de la session :", nextStep: "TV_REGISTER", end: false };
                case "closed":
                    return { text: `Les inscriptions au TV Show ${title} sont fermees.`, end: true };
                case "full":
                    return { text: `Le TV Show ${title} est complet.`, end: true };
                case "not_allowed":
                    return { text: `Ce TV Show est reserve a d'autres eleves.`, end: true };
                default:
                    return { text: "Inscrivez-vous d'abord au quiz Airtel pour participer au TV Show.", end: true };
            }
        },
    },

    // Rafraîchit l'état du direct.
    TV_LIVE: {
        step: "TV_LIVE",
        handler: async (session) => {
            const st = await tv.state(session.mobileNumber);
            if (!st) return waitScreen("Connexion au TV Show en cours...");
            if (st.mode === "live") return renderLive(session, st);
            if (st.mode === "ended") return renderEnded(st);
            return { text: "Le TV Show n'est pas en direct pour le moment.", end: true };
        },
    },

    // Écran 2 : les options de la question vue à l'écran 1.
    TV_OPTIONS: {
        step: "TV_OPTIONS",
        handler: async (session, input) => {
            const q = session.data?.tv_q;
            if (!q) return waitScreen("Question introuvable.");
            const hint = input && input !== "1" ? "Tapez 0 pour repondre.\n" : "";
            return {
                text: `${hint}${q.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n0. Repondre`,
                nextSteps: { "0": "TV_ANSWER_INPUT" },
                invalidStep: "TV_OPTIONS",
                end: false,
            };
        },
    },

    // Écran 3 : saisie de la réponse.
    TV_ANSWER_INPUT: {
        step: "TV_ANSWER_INPUT",
        handler: async (session) => {
            const q = session.data?.tv_q;
            if (!q) return waitScreen("Question introuvable.");
            return { text: `Q${q.position} - Votre reponse (1 a 4) :`, nextStep: "TV_SUBMIT", end: false };
        },
    },

    TV_SUBMIT: {
        step: "TV_SUBMIT",
        handler: async (session, input) => {
            const q = session.data?.tv_q;
            if (!q) return waitScreen("Question introuvable.");
            const choice = String(input || "").trim();
            if (!/^[1-4]$/.test(choice)) {
                // Saisie invalide : l'essai n'est pas consommé.
                return { text: `Choix invalide, tapez 1 a 4.\nQ${q.position} - Votre reponse :`, nextStep: "TV_SUBMIT", end: false };
            }
            let r;
            try {
                r = await tv.answer(session.mobileNumber, q.id, Number(choice));
            } catch (err) {
                logError(err, { stage: "TVSHOW_ANSWER", sessionId: session.id });
                return waitScreen("Reponse non transmise, service momentanement indisponible.");
            }
            const text = resultText(r.result, r);
            if (text) {
                session.data.tv_q = null;
                return waitScreen(text);
            }
            // not_open / invalid : on réaffiche l'état réel du direct.
            const st = await tv.state(session.mobileNumber);
            return st && st.mode === "live" ? renderLive(session, st) : waitScreen("Le TV Show n'est pas en direct.");
        },
    },
};
