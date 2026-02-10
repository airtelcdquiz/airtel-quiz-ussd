const redis = require("../redis");

const SESSION_TTL = 300; // 5 min

async function getSession(sessionId) {
  const data = await redis.get(sessionId);
  return data
    ? JSON.parse(data)
    : { step: "HOME", data: {}, sequence: 1 }; // ajout sequence
}

async function saveSession(sessionId, session) {
  await redis.set(sessionId, JSON.stringify(session), "EX", SESSION_TTL);
}

async function clearSession(sessionId) {
  await redis.del(sessionId);
}

module.exports = { getSession, saveSession, clearSession };
