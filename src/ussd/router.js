const menus = require("./menus");
const submitService = require("../services/submitService");

async function handleUssdInput(session, userInput) {
  const currentMenu = menus[session.step];

  if (!currentMenu) {
    session.step = "HOME";
    return { text: menus.HOME.text, end: false };
  }

  // Sauvegarde donnée si nécessaire
  if (currentMenu.saveAs && userInput) {
    session.data[currentMenu.saveAs] = userInput;
  }

  // Fin du parcours
  if (currentMenu.end) {
    console.log(`Fin du parcours : `, session.data)
    await submitService.submit(session.data);
    return { text: "Merci pour votre participation", end: true };
  }

  const nextStep = currentMenu.next?.[userInput];
  session.step = nextStep || session.step;

  const nextMenu = menus[session.step];
  return {
    text: nextMenu.text,
    end: !!nextMenu.end
  };
}

module.exports = handleUssdInput;
