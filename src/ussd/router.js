const menus = require("./menus");
const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");

async function handleUssdInput(session, userInput) {
  session.sequence = (session.sequence || 0) + 1;

  const currentMenu = menus[session.step];

  if (!currentMenu) {
    // fallback si step invalide
    session.step = "HOME";
    return {
      text: menus.HOME.handler ? (await menus.HOME.handler(session, null)).text : "Menu indisponible",
      end: false,
      sequence: session.sequence
    };
  }

  let result;
  try {
    result = await currentMenu.handler(session, userInput);
  } catch (err) {
    logError(err, { stage: "menuHandler", step: session.step, sessionId: session.id });
    return { text: "Erreur, veuillez réessayer", end: true, sequence: session.sequence };
  }

  // log JSON pour Kibana/Grafana
  logJson({
    event: "ROUTER_STEP",
    step: session.step,
    userInput,
    sequence: session.sequence,
    sessionData: session.data
  });

  // Si fin de parcours
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

  // navigation vers nextStep
  session.step = result.nextStep || session.step;

  // Si nextStep a un handler, récupère son texte (pour éviter que l'utilisateur voit rien)
  const nextMenu = menus[session.step];
  let text = result.text;
  if (!text && nextMenu?.handler) {
    try {
      const nextResult = await nextMenu.handler(session, null);
      text = nextResult.text;
    } catch (err) {
      text = "Erreur, veuillez réessayer";
    }
  }

  return {
    text,
    end: !!result.end,
    sequence: session.sequence
  };
}

module.exports = handleUssdInput;
