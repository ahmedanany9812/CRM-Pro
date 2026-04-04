import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  console.warn("REDIS_URL is missing in environment variables.");
}

export const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
