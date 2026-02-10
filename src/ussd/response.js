function xmlResponse({ SESSION_ID, SEQUENCE, MOBILE_NUMBER, text, end }) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
<params>
<param>
<value>
<struct>
<member><name>SESSION_ID</name><value><string>${SESSION_ID}</string></value></member>
<member><name>SEQUENCE</name><value><string>${SEQUENCE}</string></value></member>
<member><name>MOBILE_NUMBER</name><value><string>${MOBILE_NUMBER}</string></value></member>
<member><name>REQUEST_TYPE</name><value><string>RESPONSE</string></value></member>
<member><name>USSD_BODY</name><value><string>${text}</string></value></member>
<member><name>END_OF_SESSION</name><value><string>${end ? "TRUE" : "FALSE"}</string></value></member>
</struct>
</value>
</param>
</params>
</methodResponse>`;
}

module.exports = xmlResponse;
