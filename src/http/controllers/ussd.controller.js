const ussdEngine = require("../../engine/ussd.engine");
const { parseXmlRequest } = require("../../utils/xml/parser");

module.exports = {
  async handle(req, res) {
    try {
      // 1️⃣ Parser le XML reçu pour extraire SESSION_ID, MSISDN, INPUT
      const request = parseXmlRequest(req.body);

      // request = { sessionId, msisdn, input, operator }

      // 2️⃣ Appeler le moteur USSD
      const xmlResponse = await ussdEngine(request);

      // 3️⃣ Retourner le XML
      res.type("text/xml").status(200).send(xmlResponse);
    } catch (err) {
      console.error("USSD controller error:", err);

      // fallback safe
      const fallback = `<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>USSD_BODY</name>
            <value><string>Service temporairement indisponible</string></value>
          </member>
          <member>
            <name>END_OF_SESSION</name>
            <value><string>TRUE</string></value>
          </member>
        </struct>
      </value>
    </param>
  </params>
</methodResponse>`;

      res.type("text/xml").status(500).send(fallback);
    }
  }
};
