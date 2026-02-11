const { api } = require("../utils/api");

async function submit(url, data) {
  try {
    if (typeof url !== "string") {
      console.error(JSON.stringify(url));
      throw new Error("URL must be a string : " + url, typeof url);
    }

    console.log("Submitting to:", url, "data:", data);
    result = await api.post(String(url), data).catch(err => {
      console.error("#############################");
      console.error("Submit API error >>>>>>>>>>>>>");
      console.error(err.response?.data || err.message || err);
      console.error("#############################");
      throw new Error("Submit API error: " + (err.response?.data || err.message || err));
    });

    if (!result || !result.data) {
      console.error("#########################");
      console.error("Invalid submit response:");
      console.error(result);
      console.error("#########################");
      throw new Error("Invalid submit response");
    } else {
      console.error("#########################");
      console.error("Submit response:");
      console.error(result.data);
      console.error("#########################");
    }

    return result.data;
  } catch (e) {
    console.error("Submit failed", e.message);
    throw e;
  }
}

module.exports = { submit };
