const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");

const menu_home = require("./pages/home");

const menus = {
  HOME: menu_home.STARTING_POINT,
  // Ajouter d'autres menus ici
};

async function handleUssdInput(session, userInput) {
  session.sequence = (session.sequence || 0) + 1;

  // 1️⃣ Récupère le menu courant
  let currentMenu = menus[session.step] || menus.HOME;

  let result;

  try {
    // 2️⃣ Menu statique avec nextSteps
    if (currentMenu.nextSteps) {
      // Si aucune saisie, juste afficher le menu
      if (!userInput) {
        result = {
          text: currentMenu.text,
          nextSteps: currentMenu.nextSteps,
          end: !!currentMenu.end
        };
      } else {
        const choice = (userInput || "").trim();
        const nextStepFromChoice = currentMenu.nextSteps[choice];

        if (!nextStepFromChoice) {
          // Choix invalide → reste sur le même menu
          return {
            text: `Choix invalide.\n${currentMenu.text}`,
            end: false,
            sequence: session.sequence
          };
        }

        // mise à jour du step
        session.step = nextStepFromChoice;
        currentMenu = menus[session.step];
        // texte par défaut pour le menu suivant
        result = {
          text: currentMenu?.text || "",
          end: !!currentMenu?.end
        };
      }

    // 3️⃣ Menu dynamique avec handler
    } else if (currentMenu.handler) {
      result = await currentMenu.handler(session, userInput);

    // 4️⃣ Menu simple statique sans nextSteps ni handler
    } else {
      result = {
        text: currentMenu.text || "Menu indisponible",
        end: !!currentMenu.end
      };
    }

  } catch (err) {
    logError(err, { stage: "menuHandler", step: session.step, sessionId: session.id });
    return { text: "Erreur, veuillez réessayer", end: true, sequence: session.sequence };
  }

  // 5️⃣ Log JSON pour Kibana/Grafana
  logJson({
    event: "ROUTER_STEP",
    step: session.step,
    userInput,
    sequence: session.sequence,
    sessionData: session.data
  });

  // 6️⃣ Si fin de parcours → submit
  if (result.end) {
    try {
      await submitService.submit(session.data);
      logJson({ event: "SUBMIT_DATA", sessionId: session.id, data: session.data });
    } catch (err) {
      logError(err, { stage: "submitService", sessionId: session.id, sequence: session.sequence });
    }

    return {
      text: result.text,
      end: true,
      sequence: session.sequence
    };
  }

  // 7️⃣ Si nextStep n'est pas défini, reste sur le menu courant
  session.step = session.step || currentMenu.id;

  return {
    text: result.text,
    end: false,
    sequence: session.sequence
  };
}

module.exports = handleUssdInput;
