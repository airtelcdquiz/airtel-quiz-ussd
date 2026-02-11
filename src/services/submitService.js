const axios = require("axios");

async function submit(url, data) {
  try {
    console.log(data);
    await axios.post(url, data);
  } catch (e) {
    console.error("Submit failed", e.message);
  }
}

module.exports = { submit };
