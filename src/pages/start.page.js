const PAGES = require("../constants/pages");

module.exports = {
  name: PAGES.START,
  async render({ services, msisdn }) {
    try {
      const user = await services.user.findByMsisdn(msisdn);

      if (!user) {
        return [
          "Bienvenue sur Airtel Service",
          "1. S'inscrire",
          "2. Aide",
          "0. Quitter"
        ].join("\n");
      }

      return [
        `Bienvenue ${user.firstName}`,
        "1. Mon solde",
        "2. Quiz",
        "3. Mon compte",
        "0. Quitter"
      ].join("\n");
    } catch (err) {
      return [
        "Service temporairement indisponible",
        "0. Quitter"
      ].join("\n");
    }
  },

  next(input, context) {
    const choice = (input || "").trim();
    if (!context.session.userId) {
      if (choice === "1") return PAGES.REGISTER;
      if (choice === "2") return PAGES.HELP;
      return PAGES.END;
    }

    switch (choice) {
      case "1": return PAGES.BALANCE;
      case "2": return PAGES.QUIZ;
      case "3": return PAGES.ACCOUNT;
      default: return PAGES.END;
    }
  },

  end: false
};
