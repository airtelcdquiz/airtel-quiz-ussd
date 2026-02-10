function extractValue(xml, tag) {
  if (!xml) return "";

  const regex = new RegExp(
    `<member>\\s*<name>${tag}<\\/name>\\s*<value>\\s*<string>(.*?)<\\/string>\\s*<\\/value>\\s*<\\/member>`,
    "i"
  );

  const match = xml.match(regex);
  return match ? match[1] : "";
}

module.exports = { extractValue };
