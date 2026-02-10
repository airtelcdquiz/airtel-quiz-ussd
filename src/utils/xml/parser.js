// src/utils/xml/parser.js
function extractValue(xml, tag) {
  const regex = new RegExp(
    `<member>\\s*<name>${tag}<\\/name>\\s*<value><string>(.*?)<\\/string><\\/value>\\s*<\\/member>`,
    "i"
  );
  const match = xml.match(regex);
  return match ? match[1] : "";
}

module.exports.parseXmlRequest = function parseXmlRequest(xml) {
  return {
    sessionId: extractValue(xml, "SESSION_ID"),
    msisdn: extractValue(xml, "MOBILE_NUMBER"),
    input: extractValue(xml, "USSD_BODY"),
    operator: extractValue(xml, "OPERATOR") || "AIRTEL"
  };
};
