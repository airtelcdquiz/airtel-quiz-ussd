// src/config/redis.js
const Redis = require("ioredis");

function connectRedis(retries = 5, delay = 2000) {
  const redis = new Redis({
    host: "redis://ussd-redis",
    port: 6379
  });

  redis.on("error", async (err) => {
    console.error("Redis connection failed:", err.message);
    if (retries > 0) {
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
      connectRedis(retries - 1, delay);
    } else {
      console.error("Could not connect to Redis. Exiting.");
      process.exit(1);
    }
  });

  redis.on("connect", () => console.log("✅ Redis connected"));
  return redis;
}

module.exports = connectRedis();
