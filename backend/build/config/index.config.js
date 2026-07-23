"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const fs_1 = require("fs");
const dotenv_1 = require("dotenv");
// APP mode
const mode = process.env.NODE_ENV || "local";
const envFileCandidates = mode === "local" ? [`.${mode}.env`, `${mode}.env`] : [`.${mode}.env`];
const envFilePath = (_a = envFileCandidates.find((candidatePath) => (0, fs_1.existsSync)(candidatePath))) !== null && _a !== void 0 ? _a : `.${mode}.env`;
(0, dotenv_1.config)({ path: envFilePath });
const requiredFromEnv = (key) => {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
};
const numberFromEnv = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
const csvFromEnv = (value) => {
    var _a;
    return (_a = value === null || value === void 0 ? void 0 : value.split(",").map((item) => item.trim()).filter(Boolean)) !== null && _a !== void 0 ? _a : [];
};
exports.appConfig = {
    app: {
        mode,
        port: process.env.APP_PORT,
        app_host: process.env.APP_HOST,
        jwt_secret: requiredFromEnv("JWT_SECRET"),
        secretKey: requiredFromEnv("SECRET_KEY"),
        clientUrl: requiredFromEnv("CLIENT_URL"),
        allowedOrigins: csvFromEnv(process.env.ALLOWED_ORIGINS),
        bodyLimit: process.env.REQUEST_BODY_LIMIT || "100kb",
        cookieName: process.env.AUTH_COOKIE_NAME || "rentaa_session",
        cookieSameSite: process.env.AUTH_COOKIE_SAME_SITE || "strict",
        loginTokenTtl: process.env.LOGIN_TOKEN_TTL || "1h",
        authCookieMaxAgeMs: numberFromEnv(process.env.AUTH_COOKIE_MAX_AGE_MS, 60 * 60 * 1000),
        authRateLimitWindowMs: numberFromEnv(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
        authRateLimitMax: numberFromEnv(process.env.AUTH_RATE_LIMIT_MAX, 10),
        adminRateLimitWindowMs: numberFromEnv(process.env.ADMIN_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
        adminRateLimitMax: numberFromEnv(process.env.ADMIN_RATE_LIMIT_MAX, 60),
        globalRateLimitWindowMs: numberFromEnv(process.env.GLOBAL_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
        globalRateLimitMax: numberFromEnv(process.env.GLOBAL_RATE_LIMIT_MAX, 100),
    },
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: numberFromEnv(process.env.REDIS_PORT, 6379),
        password: process.env.REDIS_PASSWORD &&
            process.env.REDIS_PASSWORD !== "your_redis_password"
            ? process.env.REDIS_PASSWORD
            : undefined,
    },
    db: {
        db_name: process.env.POSTGRES_DB,
        db_user: process.env.POSTGRES_USER,
        db_password: process.env.POSTGRES_PASSWORD,
        db_host: process.env.POSTGRES_HOST,
        db_port: Number(process.env.POSTGRES_PORT),
    },
    smtp: {
        host: requiredFromEnv("SMTP_HOST"),
        port: Number(process.env.SMTP_PORT),
        user: requiredFromEnv("SMTP_EMAIL"),
        password: requiredFromEnv("SMTP_PASSWORD"),
        fromName: requiredFromEnv("SMTP_FROM_NAME"),
    },
    s3: {
        region: process.env.AWS_REGION || "us-east-1",
        bucket: requiredFromEnv("AWS_S3_BUCKET"),
        propertyImagePrefix: process.env.AWS_S3_PROPERTY_IMAGE_PREFIX || "property-images",
        publicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL,
        presignedUploadTtlSeconds: numberFromEnv(process.env.AWS_PRESIGNED_UPLOAD_TTL_SECONDS, 300),
        propertyImageMaxBytes: numberFromEnv(process.env.PROPERTY_IMAGE_MAX_BYTES, 5 * 1024 * 1024),
        allowedImageTypes: csvFromEnv(process.env.PROPERTY_IMAGE_ALLOWED_TYPES),
    },
    externalAPIs: {
        muscleWiki: process.env.MUSCLEWIKI_API_KEY,
    },
};
