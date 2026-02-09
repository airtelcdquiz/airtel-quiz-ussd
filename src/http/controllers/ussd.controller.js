module.exports = {
  async handle(req, res) {
    res
      .type("text/xml")
      .send(`<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
  <params>
    <param>
      <value>
        <struct>
          <member>
            <name>USSD_BODY</name>
            <value><string>Bienvenue USSD</string></value>
          </member>
          <member>
            <name>END_OF_SESSION</name>
            <value><string>FALSE</string></value>
          </member>
        </struct>
      </value>
    </param>
  </params>
</methodResponse>`);
  }
};