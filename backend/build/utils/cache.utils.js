"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCacheByPattern = exports.cacheResponse = exports.buildCacheKey = void 0;
const connectRedis_1 = require("../config/connectRedis");
const logger_utils_1 = require("./logger.utils");
const defaultCacheSeconds = 60;
const buildCacheKey = (namespace, req) => {
    return `${namespace}:${req.originalUrl}`;
};
exports.buildCacheKey = buildCacheKey;
const cacheResponse = (namespace, ttlSeconds = defaultCacheSeconds) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        if (req.method !== "GET" || connectRedis_1.redisClient.status !== "ready") {
            next();
            return;
        }
        const cacheKey = (0, exports.buildCacheKey)(namespace, req);
        try {
            const cachedPayload = yield connectRedis_1.redisClient.get(cacheKey);
            if (cachedPayload) {
                res.status(200).json(JSON.parse(cachedPayload));
                return;
            }
            const originalJson = res.json.bind(res);
            res.json = (payload) => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    void connectRedis_1.redisClient
                        .set(cacheKey, JSON.stringify(payload), "EX", ttlSeconds)
                        .catch((error) => logger_utils_1.logger.error("Error writing response cache:", error));
                }
                return originalJson(payload);
            };
        }
        catch (error) {
            logger_utils_1.logger.error("Error reading response cache:", error);
        }
        next();
    });
};
exports.cacheResponse = cacheResponse;
const deleteCacheByPattern = (pattern) => __awaiter(void 0, void 0, void 0, function* () {
    if (connectRedis_1.redisClient.status !== "ready")
        return;
    let cursor = "0";
    do {
        const [nextCursor, keys] = yield connectRedis_1.redisClient.scan(cursor, "MATCH", pattern, "COUNT", 100);
        cursor = nextCursor;
        if (keys.length) {
            yield connectRedis_1.redisClient.del(...keys);
        }
    } while (cursor !== "0");
});
exports.deleteCacheByPattern = deleteCacheByPattern;
