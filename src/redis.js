const Redis = require("ioredis");

const redis = new Redis({
  host: "ussd-redis",
  port: 6379,
});

module.exports = redis;
