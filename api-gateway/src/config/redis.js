const Redis = require("ioredis");

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

redis.on("error", (err) => {
  console.error("[Redis]", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] connected");
});

module.exports = redis;
