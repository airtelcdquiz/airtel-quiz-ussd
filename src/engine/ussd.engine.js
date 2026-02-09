module.exports = async function process(request) {
  const context = await buildContext(request);

  const page = registry.get(context.session.page);
  const text = await page.render(context);

  const nextPage = page.next(context.input, context);
  await context.sessionService.update(context.session.id, nextPage);

  return buildXmlResponse(context, text, page.end);
};
