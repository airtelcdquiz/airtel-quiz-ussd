const { logJson, logError } = require("../utils/logger");
const { getMenu, getMenuText } = require("../services/menus.service");

async function handleUssdInput(session, userInput) {
  session.sequence = (session.sequence || 0) + 1;

  // 1️⃣ Récupérer le menu courant
  let menu = await getMenu(session.step || "HOME");

  // 2️⃣ Sauvegarder l'input utilisateur si le menu a un save_as
  if (menu.save_as && userInput) {
    session.data[menu.save_as] = userInput.trim();
  }

  // 3️⃣ MENU DYNAMIQUE → Appel API
  if (menu.type === "dynamic" && menu.api_url) {
    try {
      const res = await fetch(menu.api_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.id,
          input: userInput,
          data: session.data
        })
      });

      if (!res.ok) throw new Error(`API returned ${res.status}`);

      const dynamicMenu = await res.json();

      if (!dynamicMenu || !dynamicMenu.text) {
        throw new Error("Invalid dynamic menu response");
      }

      menu = dynamicMenu; // remplacer le menu courant par la réponse
    } catch (err) {
      console.error("[USSD] Dynamic menu fetch failed:", err.message);
      return {
        text: "Erreur serveur, veuillez réessayer plus tard.",
        end: true,
        sequence: session.sequence
      };
    }
  }

  // 4️⃣ MENU FINAL → submit
  if (menu.type === "end") {
    if (!menu.api_url) {
      throw new Error(`End menu ${menu.id} doit avoir api_url`);
    }

    try {
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
    } catch (err) {
      console.error("[USSD] Submit failed:", err.message);
      return {
        text: "Erreur serveur, veuillez réessayer plus tard.",
        end: true,
        sequence: session.sequence
      };
    }
  }

  // 5️⃣ DÉTERMINER LA PROCHAINE ÉTAPE (static ou options)
  let nextStep = menu.next_step; // valeur par défaut

  if (menu.options && userInput) {
    const choice = userInput.trim();
    nextStep = menu.options[choice] || nextStep;
  }

  // 6️⃣ Si aucune prochaine étape → menu final par défaut
  if (!nextStep) {
    return {
      text: "Merci et au revoir !",
      end: true,
      sequence: session.sequence
    };
  }

  session.step = nextStep;

  return {
    text: menu.text,
    end: false,
    sequence: session.sequence
  };
}

module.exports = handleUssdInput;
