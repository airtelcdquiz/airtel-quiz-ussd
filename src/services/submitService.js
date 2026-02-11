const { api } = require("../utils/api");

async function submit(url, data) {
  try {
    console.log(data);
    await api.post(url, data);
  } catch (e) {
    console.error("Submit failed", e.message);
  }
}

module.exports = { submit };
