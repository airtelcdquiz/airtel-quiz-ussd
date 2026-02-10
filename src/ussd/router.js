const menus = require("./menus");
const submitService = require("../services/submitService");
const { logJson, logError } = require("../utils/logger");
const { getMenu, getMenuText } = require("../services/menus.service");

async function handleUssdInput(session, userInput) {
  session.sequence = (session.sequence || 0) + 1;

  let menu = await getMenu(session.step || "HOME");

  // 1️⃣ Sauvegarde input UNIQUEMENT si menu le demande
  if (menu.save_as && userInput && menu.type !== "static") {
    session.data[menu.save_as] = userInput;
  }

  // 2️⃣ Menu dynamique → API menu
  if (menu.type === "dynamic" && menu.api_url) {
    let res;
    try {
      res = await fetch(menu.api_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          input: userInput,
          data: session.data
        })
      });
    } catch (e) {
      throw new Error(`Dynamic menu API unreachable: ${menu.api_url}`);
    }

    if (!res.ok) {
      throw new Error(`Dynamic menu API error ${res.status}`);
    }

    const dynamicMenu = await res.json();

    if (!dynamicMenu || !dynamicMenu.text) {
      throw new Error("Invalid dynamic menu format");
    }

    menu = dynamicMenu;
  }

  // 3️⃣ MENU FINAL UNIQUEMENT
  if (menu.type === "end") {
    if (!menu.api_url) {
      throw new Error(`End menu ${menu.id} sans api_url`);
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
  session.step = menu.next_step;

  return {
    text: menu.text,
    end: false,
    sequence: session.sequence
  };
}


module.exports = handleUssdInput;
