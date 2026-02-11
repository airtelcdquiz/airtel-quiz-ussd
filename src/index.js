const express = require("express");
const { extractValue } = require("./utils/xml");
const { getSession, saveSession, clearSession } = require("./ussd/session");
const handleUssdInput = require("./ussd/router");
const xmlResponse = require("./ussd/response");
const { logJson, logError } = require("./utils/logger");


const app = express();
app.use(express.text({ type: ["text/xml", "application/xml"] }));

app.post("/ussd", async (req, res) => {
  const xml = req.body;

  // Log JSON brut de la requête
  logJson({ event: "USSD_REQUEST", xml });

  const SESSION_ID = extractValue(xml, "SESSION_ID");
  const MOBILE_NUMBER = extractValue(xml, "MOBILE_NUMBER");
  const USER_INPUT = extractValue(xml, "USSD_BODY");

  let session = null;
  let result = null;

  try {
    session = await getSession(SESSION_ID, defaultSession = { step: "HOME", data: {mobileNumber: MOBILE_NUMBER}, sequence: 1, id: SESSION_ID, mobileNumber: MOBILE_NUMBER });

    try {
      result = await handleUssdInput(session, USER_INPUT);
    } catch (err) {
      logError(err, { stage: "handleUssdInput", sessionId: SESSION_ID });
      // réponse USSD générique en cas d'erreur
      result = { text: "Erreur, veuillez réessayer", end: true, sequence: session?.sequence || 1 };
    }

    if (result.end) {
      await clearSession(SESSION_ID);
    } else {
      await saveSession(SESSION_ID, session);
    }

    res.set("Content-Type", "text/xml");
    res.send(xmlResponse({
      SESSION_ID,
      SEQUENCE: result.sequence,
      MOBILE_NUMBER,
      text: result.text,
      end: result.end
    }));

    // log JSON final
    logJson({
      event: "USSD_RESPONSE",
      sessionId: SESSION_ID,
      mobileNumber: MOBILE_NUMBER,
      userInput: USER_INPUT,
      step: session?.step,
      sequence: result.sequence,
      end: result.end,
      sessionData: session?.data
    });

  } catch (err) {
    logError(err, { stage: "USSD_POST_HANDLER", sessionId: SESSION_ID });
    res.status(500).send("Internal Server Error");
  }
});

app.listen(3000, () => logJson({ event: "SERVER_STARTED", port: 3000 }));