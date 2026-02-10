const registry = require("./state.registry");
const buildContext = require("./context.builder");
const { buildXmlResponse } = require("../utils/xml/builder");

module.exports = async function ussdEngine(request) {
  const context = await buildContext(request);

  const currentPage = registry.get(context.session.page) || registry.get("START");

  // render dynamique
  const text = await currentPage.render(context);

  // next page
  const nextPageName = currentPage.next(context.input, context);

  // sauvegarde session
  await context.sessionService.update(context.session.id, {
    page: nextPageName,
    userId: context.session.userId || null,
    data: context.session.data || {}
  });

  // déterminer si session termine
  const endSession = currentPage.end || nextPageName === "END";

  return buildXmlResponse(context, text, endSession);
};
