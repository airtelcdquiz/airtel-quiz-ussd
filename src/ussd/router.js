const menus = require("./menus");
const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");

async function handleUssdInput(session, userInput) {
  session.sequence = (session.sequence || 0) + 1;

  const currentMenu = menus[session.step];

  logJson({
    event: "ROUTER_STEP",
    step: session.step,
    userInput,
    sequence: session.sequence,
    sessionData: session.data
  });

  if (!currentMenu) {
    session.step = "HOME";
    return { text: menus.HOME.text, end: false, sequence: session.sequence };
  }

  if (currentMenu.saveAs && userInput) {
    session.data[currentMenu.saveAs] = userInput;
  }

  if (currentMenu.end) {
    try {
      await submitService.submit(session.data);
    } catch (err) {
      logError(err, { stage: "submitService", sessionId: session.id, sequence: session.sequence });
    }

    logJson({
      event: "SESSION_END",
      sessionId: session.id,
      sequence: session.sequence,
      sessionData: session.data
    });

    return { text: "Merci pour votre participation", end: true, sequence: session.sequence };
  }

  const nextStep = currentMenu.next?.[userInput] || session.step;
  session.step = nextStep;

  return {
    text: menus[session.step].text,
    end: !!menus[session.step].end,
    sequence: session.sequence
  };
}

module.exports = handleUssdInput;
