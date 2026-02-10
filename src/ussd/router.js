const menus = require("./menus");
const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");

async function handleUssdInput(session, userInput) {
  session.sequence = (session.sequence || 0) + 1;

  const currentMenu = menus[session.step];

  // Sauvegarde la réponse si saveAs défini
  if (currentMenu?.saveAs && userInput) {
    session.data[currentMenu.saveAs] = userInput;
  }

  logJson({
    event: "ROUTER_STEP",
    step: session.step,
    userInput,
    sequence: session.sequence,
    sessionData: session.data
  });

  // Si fin de parcours
  if (currentMenu?.end) {
    try {
      logJson({ event: "SUBMIT_DATA", sessionId: session.id, data: session.data });
      await submitService.submit(session.data);
    } catch (err) {
      logError(err, { stage: "submitService", sessionId: session.id, sequence: session.sequence });
    }

    return {
      text: currentMenu.text,
      end: true,
      sequence: session.sequence
    };
  }

  // Détermine le prochain menu
  let nextStep;
  if (currentMenu.next?.[userInput]) {
    nextStep = currentMenu.next[userInput];
  } else if (currentMenu.next?.default) {
    nextStep = currentMenu.next.default;
  } else {
    nextStep = session.step;
  }

  session.step = nextStep;

  return {
    text: menus[session.step].text,
    end: !!menus[session.step].end,
    sequence: session.sequence
  };
}

module.exports = handleUssdInput;
