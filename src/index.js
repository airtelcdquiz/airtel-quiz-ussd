const express = require("express");
const app = express();

app.use(express.text({ type: ["text/xml", "application/xml"], limit: "1mb" }));
app.use((req, res, next) => {
  if (req.method === "POST") {
    const ct = (req.headers["content-type"] || "").toLowerCase();
    const isXml = ct.includes("text/xml") || ct.includes("application/xml");
    if (!isXml) {
      return res.status(415).send("Unsupported Media Type (XML-RPC only)");
    }
  }
  next();
});


function extractValue(xml, tag) {
  const regex = new RegExp(
    `<member>\\s*<name>${tag}<\\/name>\\s*<value><string>(.*?)<\\/string><\\/value>\\s*<\\/member>`,
    "i"
  );
  const match = xml.match(regex);
  return match ? match[1] : "";
}

app.all("/ussd", (req, res) => {
  const xmlRequest = req.body || "";

  // paramètres envoyés

  const SESSION_ID = extractValue(xmlRequest, "SESSION_ID") || "44786";
  const SEQUENCE   = extractValue(xmlRequest, "SEQUENCE") || "1";
  const MOBILE_NUMBER     = extractValue(xmlRequest, "MOBILE_NUMBER") || "243000000000";

  console.log("SESSION_ID:", SESSION_ID);
  console.log("SEQUENCE:", SEQUENCE);
  console.log("MOBILE_NUMBER:", MOBILE_NUMBER);

  const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>SESSION_ID</name>
            <value><string>${SESSION_ID}</string></value>
          </member>
          <member>
            <name>SERVICE_KEY</name>
            <value><string>4405</string></value>
          </member>

          <member>
            <name>SEQUENCE</name>
            <value><string>${SEQUENCE}</string></value>
          </member>

          <member>
            <name>MOBILE_NUMBER</name>
            <value><string>${MOBILE_NUMBER}</string></value>
          </member>

          <member>
            <name>REQUEST_TYPE</name>
            <value><string>RESPONSE</string></value>
          </member>

          <member>
            <name>USSD_BODY</name>
            <value>
              <string>1.Airtel Quiz Default Service</string>
            </value>
          </member>

          <member>
            <name>END_OF_SESSION</name>
            <value><string>FALSE</string></value>
          </member>

        </struct>
      </value>
    </param>
  </params>
</methodResponse>`;

  res.set("Content-Type", "text/xml; charset=utf-8");
  return res.status(200).send(xmlResponse);
});

app.listen(3000, "0.0.0.0", () => {
  console.log("USSD XML-RPC Airtel gateway running");
});