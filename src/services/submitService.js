const axios = require("axios");

async function submit(data) {
  try {
    console.log(data);
    await axios.post("https://api.exemple.com/ussd", data);
  } catch (e) {
    console.error("Submit failed", e.message);
  }
}

module.exports = { submit };
