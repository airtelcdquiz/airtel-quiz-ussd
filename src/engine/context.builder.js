module.exports = async function buildContext(request) {
  const session = await sessionService.getOrCreate(request.sessionId);

  return {
    input: request.input,
    msisdn: request.msisdn,
    operator: request.operator,
    lang: session.lang || "fr",

    session,
    sessionService,

    services: {
      user: userService,
      balance: balanceService,
      quiz: quizService,
      payment: paymentService
    }
  };
};
