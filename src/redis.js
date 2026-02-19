const Redis = require("ioredis");

const redis = new Redis({
  host: "ussd-redis",
  port: 6379,
  retryStrategy(times) {
    return Math.min(times * 200, 2000);
  },
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

redis.on("connect", () => {
  console.log("Connected to Redis");
});

module.exports = redis;