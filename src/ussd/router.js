const menus = require("./menus");
const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");

async function handleUssdInput(session, userInput) {
  session.sequence = (session.sequence || 0) + 1;
  const currentMenu = menus[session.step];

  if (!currentMenu) {
    session.step = "HOME";
    return { text: menus.HOME.handler, end: false, sequence: session.sequence };
  }

  let result;
  try {
    result = await currentMenu.handler(session, userInput);
  } catch (err) {
    logError(err, { stage: "menuHandler", step: session.step, sessionId: session.id });
    return { text: "Erreur, veuillez réessayer", end: true, sequence: session.sequence };
  }

  // Fin de session
  if (result.end) {
    try {
      await submitService.submit(session.data);
    } catch (err) {
      logError(err, { stage: "submitService", sessionId: session.id });
    }
    return { text: result.text, end: true, sequence: session.sequence };
  }

  // Navigation vers nextStep
  session.step = result.nextStep || session.step;

  return { text: result.text, end: false, sequence: session.sequence };
}

module.exports = handleUssdInput;
