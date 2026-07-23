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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const index_config_1 = require("./index.config");
const logger_utils_1 = require("../utils/logger.utils");
exports.redisClient = new ioredis_1.default({
    host: index_config_1.appConfig.redis.host,
    port: index_config_1.appConfig.redis.port,
    password: index_config_1.appConfig.redis.password,
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    retryStrategy: null,
});
exports.redisClient.on("error", (error) => {
    logger_utils_1.logger.error("Redis connection error:", error);
});
const connectRedis = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (exports.redisClient.status === "ready")
            return;
        yield exports.redisClient.connect();
        logger_utils_1.logger.info("Connected to Redis successfully");
    }
    catch (error) {
        logger_utils_1.logger.error("Error connecting to Redis:", error);
    }
});
exports.connectRedis = connectRedis;
exports.default = exports.connectRedis;
