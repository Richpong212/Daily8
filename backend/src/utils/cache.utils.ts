import { NextFunction, Request, RequestHandler, Response } from "express";
import { redisClient } from "../config/connectRedis";
import { logger } from "./logger.utils";

const defaultCacheSeconds = 60;

export const buildCacheKey = (namespace: string, req: Request) => {
  return `${namespace}:${req.originalUrl}`;
};

export const cacheResponse = (
  namespace: string,
  ttlSeconds = defaultCacheSeconds,
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== "GET" || redisClient.status !== "ready") {
      next();
      return;
    }

    const cacheKey = buildCacheKey(namespace, req);

    try {
      const cachedPayload = await redisClient.get(cacheKey);

      if (cachedPayload) {
        res.status(200).json(JSON.parse(cachedPayload));
        return;
      }

      const originalJson = res.json.bind(res);

      res.json = (payload: unknown) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          void redisClient
            .set(cacheKey, JSON.stringify(payload), "EX", ttlSeconds)
            .catch((error: unknown) =>
              logger.error("Error writing response cache:", error),
            );
        }

        return originalJson(payload);
      };
    } catch (error) {
      logger.error("Error reading response cache:", error);
    }

    next();
  };
};

export const deleteCacheByPattern = async (pattern: string) => {
  if (redisClient.status !== "ready") return;

  let cursor = "0";

  do {
    const [nextCursor, keys] = await redisClient.scan(
      cursor,
      "MATCH",
      pattern,
      "COUNT",
      100,
    );
    cursor = nextCursor;

    if (keys.length) {
      await redisClient.del(...keys);
    }
  } while (cursor !== "0");
};
