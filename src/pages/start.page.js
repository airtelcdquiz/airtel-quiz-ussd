// src/pages/start.page.js

const PAGES = require("../constants/pages");

module.exports = {
  name: PAGES.START,

  /**
   * Affichage du menu
   * Peut être dynamique (DB, API, cache, etc.)
   */
  async render(context) {
    const { services, msisdn, lang } = context;

    try {
      // Récupération utilisateur (cache / DB)
      const user = await services.user.findByMsisdn(msisdn);

      // Utilisateur inconnu
      if (!user) {
        return [
          "Bienvenue sur Airtel Service",
          "1. S'inscrire",
          "2. Aide",
          "0. Quitter"
        ].join("\n");
      }

      // Utilisateur connu
      return [
        `Bienvenue ${user.firstName}`,
        "1. Mon solde",
        "2. Quiz",
        "3. Mon compte",
        "0. Quitter"
      ].join("\n");

    } catch (err) {
      // fallback safe (TRÈS IMPORTANT EN USSD)
      return [
        "Service temporairement indisponible",
        "0. Quitter"
      ].join("\n");
    }
  },

  /**
   * Décision de navigation
   */
  next(input, context) {
    const { session } = context;

    // Normalisation input
    const choice = (input || "").trim();

    // Si utilisateur inconnu
    if (!session.userId) {
      if (choice === "1") return PAGES.REGISTER;
      if (choice === "2") return PAGES.HELP;
      return PAGES.END;
    }

    // Utilisateur connu
    switch (choice) {
      case "1":
        return PAGES.BALANCE;
      case "2":
        return PAGES.QUIZ;
      case "3":
        return PAGES.ACCOUNT;
      default:
        return PAGES.END;
    }
  },

  end: false
};
