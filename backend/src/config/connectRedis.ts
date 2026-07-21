import Redis from "ioredis";
import { appConfig } from "./index.config";
import { logger } from "../utils/logger.utils";

export const redisClient = new Redis({
  host: appConfig.redis.host,
  port: appConfig.redis.port,
  password: appConfig.redis.password,
  lazyConnect: true,
  enableOfflineQueue: false,
  maxRetriesPerRequest: 1,
  retryStrategy: null,
});

redisClient.on("error", (error: unknown) => {
  logger.error("Redis connection error:", error);
});

export const connectRedis = async () => {
  try {
    if (redisClient.status === "ready") return;

    await redisClient.connect();
    logger.info("Connected to Redis successfully");
  } catch (error) {
    logger.error("Error connecting to Redis:", error);
  }
};

export default connectRedis;
