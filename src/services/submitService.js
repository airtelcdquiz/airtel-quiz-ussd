const { api } = require("../utils/api");

async function submit(url, data) {
  try {
    if (typeof url !== "string") {
      throw new Error("URL must be a string : " + url);
    }

    console.log("Submitting to:", url, "data:", data);
    await api.post(String(url), data)
  } catch (e) {
    console.error("Submit failed", e.message);
  }
}

module.exports = { submit };
