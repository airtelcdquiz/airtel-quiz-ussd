function logJson(data) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    ...data
  }));
}

function logError(error, context = {}) {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: "error",
    message: error.message,
    stack: error.stack,
    ...context
  }));
}

module.exports = { logJson, logError };
