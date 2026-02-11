const { api } = require("../utils/api");
const { logJson, logError } = require("../utils/logger");

async function submit(url, data) {
  try {
    if (typeof url !== "string") {
      logError(new Error("URL must be a string"), { stage: "submitService", url, data }); 
      throw new Error("URL must be a string : " + url, typeof url);
    }

    logJson({ event: "SUBMIT_START", url, data }); 
    result = await api.post(String(url), data).catch(err => {
      logError(err, { stage: "submitService", url, data }); 
      throw new Error("Submit API error: " + (err.response?.data || err.message || err));
    });

    if (!result || !result.data) {
      logError(new Error("Invalid submit response"), { stage: "submitService", url, data, result }); 
      throw new Error("Invalid submit response");
    } else {
      logJson({ event: "SUBMIT_SUCCESS", url, data, response: result.data }); 
    }

    return result.data;
  } catch (e) {
    logError(e, { stage: "submitService", url, data }); 
    throw e;
  }
}

module.exports = { submit };
