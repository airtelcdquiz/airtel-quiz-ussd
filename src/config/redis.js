const Redis = require("ioredis");

// Utiliser la variable d'environnement REDIS_URL
const redis = new Redis(process.env.REDIS_URL);

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err));

module.exports = redis;
