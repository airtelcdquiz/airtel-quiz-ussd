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
      // si on a un input
      if (userInput) {
        const choice = userInput.trim();
        const nextStepFromChoice = currentMenu.nextSteps[choice];

        if (!nextStepFromChoice) {
          return {
            text: `Choix invalide.\n${currentMenu.text}`,
            end: false,
            sequence: session.sequence
          };
        }

        // Mettre à jour le step avant d’appeler le handler
        session.step = nextStepFromChoice;
        currentMenu = menus[session.step];

      } else {
        // pas d'input : rester sur le menu courant
        result = {
          text: currentMenu.text,
          nextSteps: currentMenu.nextSteps,
          end: !!currentMenu.end
        };
      }
    }

    // 3️⃣ Menu dynamique ou statique avec handler
    if (currentMenu?.handler) {
      // sauvegarde input si saveAs défini
      if (currentMenu.saveAs && userInput) {
        session.data = session.data || {};
        session.data[currentMenu.saveAs] = userInput;
      }

      result = await currentMenu.handler(session, userInput);

    // 4️⃣ Menu simple statique sans handler ni nextSteps
    } else if (!result) {
      result = {
        text: currentMenu.text || "Menu indisponible",
        end: !!currentMenu.end
      };
    }

  } catch (err) {
    logError(err, { stage: "menuHandler", step: session.step, sessionId: session.id });
    return { text: "Erreur, veuillez réessayer", end: true, sequence: session.sequence };
  }

  // 5️⃣ Log JSON
  logJson({
    event: "ROUTER_STEP",
    step: session.step,
    userInput,
    sequence: session.sequence,
    sessionData: session.data
  });

  // 6️⃣ Fin de parcours
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

  return {
    text: result.text,
    end: false,
    sequence: session.sequence
  };
}


module.exports = handleUssdInput;
