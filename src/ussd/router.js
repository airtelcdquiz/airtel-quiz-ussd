const menus = require("./menus");
const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");
const { getMenu, getMenuText } = require("../services/menus.service");

async function handleUssdInput(session, userInput) {
  session.sequence = (session.sequence || 0) + 1;

  let menu = await getMenu(session.step || "HOME");

  // 1️⃣ Sauvegarde input utilisateur
  if (menu.save_as && userInput) {
    session.data[menu.save_as] = userInput;
  }

  // 2️⃣ Menu dynamique → API menu
  if (menu.type === "dynamic" && !menu.isend && menu.api_url) {
    const res = await fetch(menu.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        input: userInput,
        data: session.data
      })
    });
    menu = await res.json(); // TOUJOURS un USSDMenu
  }

  // 3️⃣ Menu FINAL → SUBMIT
  if (menu.isend) {
    if (!menu.api_url) {
      throw new Error(`Menu ${menu.id} end=true sans apiUrl`);
    }

    await fetch(menu.api_url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: session.id,
        msisdn: session.msisdn,
        data: session.data
      })
    });

    logJson({
      event: "USSD_SUBMIT",
      menuId: menu.id,
      sessionId: session.id,
      data: session.data
    });

    return {
      text: menu.text,
      end: true,
      sequence: session.sequence
    };
  }

  // 4️⃣ Navigation normale
  session.step = menu.next_step || session.step;

  return {
    text: menu.text,
    end: false,
    sequence: session.sequence
  };
}


module.exports = handleUssdInput;
