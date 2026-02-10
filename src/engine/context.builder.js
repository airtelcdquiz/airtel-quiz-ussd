const sessionService = require("../services/session.service");
const userService = require("../services/user.service");
const balanceService = require("../services/balance.service");

module.exports = async function buildContext(request) {
  const { sessionId, msisdn, input, operator } = request;

  // récupérer ou créer session
  const session = await sessionService.getOrCreate(sessionId);

  return {
    session,
    sessionService,
    input,
    msisdn,
    operator,
    lang: session.lang || "fr",
    services: {
      user: userService,
      balance: balanceService
      // ajouter plus tard quiz, paiement, etc.
    }
  };
};
