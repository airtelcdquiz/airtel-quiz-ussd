const redis = require("../redis");

const SESSION_TTL = 300; // 5 min

async function getSession(sessionId, defaultSession = { step: "HOME", data: {}, sequence: 1 }) {
  const data = await redis.get(sessionId);
  return data
    ? JSON.parse(data)
    : defaultSession;
}

async function saveSession(sessionId, session) {
  await redis.set(sessionId, JSON.stringify(session), "EX", SESSION_TTL);
}

async function clearSession(sessionId) {
  await redis.del(sessionId);
}

module.exports = { getSession, saveSession, clearSession };
