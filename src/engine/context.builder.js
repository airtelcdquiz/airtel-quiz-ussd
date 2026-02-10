const sessionService = require("../services/session.service");
const userService = require("../services/user.service");

module.exports = async function buildContext(request) {
  const { sessionId, msisdn, input, operator } = request;

  // Récupérer ou créer la session
  const session = await sessionService.getOrCreate(sessionId);

  // Si nouvelle session, définir page de départ = START
  if (!session.page) {
    session.page = "START";   // <-- page de début
    await sessionService.update(sessionId, session);
  }

  return {
    session,
    sessionService,
    input,
    msisdn,
    operator,
    lang: session.lang || "fr",
    services: {
      user: userService,
      // autres services
    }
  };
};
