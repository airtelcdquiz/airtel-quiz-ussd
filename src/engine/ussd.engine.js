const registry = require("./state.registry");
const buildContext = require("./context.builder");
const { buildXmlResponse } = require("../utils/xml/builder");

module.exports = async function ussdEngine(request) {
  const context = await buildContext(request);

  // Page courante = session.page
  const currentPage = registry.get(context.session.page) || registry.get("START");

  const text = await currentPage.render(context);
  const nextPageName = currentPage.next(context.input, context);

  // Mettre à jour la session avec la prochaine page
  await context.sessionService.update(context.session.id, {
    ...context.session,
    page: nextPageName
  });

  const endSession = currentPage.end || nextPageName === "END";

  return buildXmlResponse(context, text, endSession);
};
