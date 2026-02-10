// src/config/index.js
// Responsabilité : centraliser la configuration de l'application (port, DB, cache, etc.).

module.exports = {
  port: process.env.PORT || 3000,
  redisUrl: process.env.REDIS_URL || "redis://ussd-redis:6379",
  sessionTtl: parseInt(process.env.USSD_SESSION_TTL || "240", 10)
};