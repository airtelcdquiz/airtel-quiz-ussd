const express = require("express");
const { getSession, saveSession, clearSession } = require("./ussd/session");
const handleUssdInput = require("./ussd/router");
const xmlResponse = require("./ussd/response");

const app = express();
app.use(express.text({ type: ["text/xml", "application/xml"] }));

app.post("/ussd", async (req, res) => {
  const xml = req.body;

  const SESSION_ID = extractValue(xml, "SESSION_ID");
  const SEQUENCE = extractValue(xml, "SEQUENCE");
  const MOBILE_NUMBER = extractValue(xml, "MOBILE_NUMBER");
  const USER_INPUT = extractValue(xml, "USSD_BODY");

  const session = await getSession(SESSION_ID);
  const result = await handleUssdInput(session, USER_INPUT);

  if (result.end) {
    await clearSession(SESSION_ID);
  } else {
    await saveSession(SESSION_ID, session);
  }

  res.set("Content-Type", "text/xml");
  res.send(xmlResponse({
    SESSION_ID,
    SEQUENCE,
    MOBILE_NUMBER,
    text: result.text,
    end: result.end
  }));
});

app.listen(3000, () => console.log("USSD ready"));
