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
exports.connectDb = exports.db = void 0;
const sequelize_1 = require("sequelize");
const index_config_1 = require("./index.config");
const logger_utils_1 = require("../utils/logger.utils");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
exports.db = new sequelize_1.Sequelize(index_config_1.appConfig.db.db_name, index_config_1.appConfig.db.db_user, index_config_1.appConfig.db.db_password, {
    host: index_config_1.appConfig.db.db_host,
    port: index_config_1.appConfig.db.db_port,
    dialect: "postgres",
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
});
const connectDb = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        logger_utils_1.logger.info("[DATABASE] Connecting to PostgreSQL...");
        yield exports.db.authenticate();
        logger_utils_1.logger.info(`[DATABASE] Connected to PostgreSQL (${index_config_1.appConfig.db.db_host}:${index_config_1.appConfig.db.db_port})`);
        logger_utils_1.logger.info("[MODELS] Loading Sequelize models...");
        const modelPath = path_1.default.join(__dirname, "../models");
        const allFiles = yield fs_1.default.promises.readdir(modelPath);
        const modelFiles = allFiles.filter((file) => (file.endsWith(".js") || file.endsWith(".ts")) &&
            file !== "association.ts" &&
            file !== "association.js" &&
            file !== "associations.model.ts" &&
            file !== "associations.model.js");
        let loadedModels = 0;
        modelFiles.forEach((file) => {
            try {
                const filePath = path_1.default.join(modelPath, file);
                const model = require(filePath).default;
                if (model) {
                    exports.db.models[model.name] = model;
                    loadedModels++;
                    logger_utils_1.logger.info(`[MODELS] Loaded model: ${model.name}`);
                }
                else {
                    logger_utils_1.logger.warn(`[MODELS] No default export found in ${file}`);
                }
            }
            catch (err) {
                logger_utils_1.logger.error(`[MODELS] Failed loading model: ${file}`);
                logger_utils_1.logger.error(err);
            }
        });
        logger_utils_1.logger.info(`[MODELS] Total models loaded: ${loadedModels}`);
        const { applyModelAssociations } = require("../models/association");
        applyModelAssociations();
        logger_utils_1.logger.info("[MODELS] Applied model associations");
        logger_utils_1.logger.info("[DATABASE] Synchronizing database schema...");
        yield exports.db.sync({
            alter: true,
            force: false,
        });
        logger_utils_1.logger.info("[DATABASE] Database synchronized successfully");
    }
    catch (error) {
        logger_utils_1.logger.error("[DATABASE] Unable to connect to the database");
        logger_utils_1.logger.error(error instanceof Error ? ((_a = error.stack) !== null && _a !== void 0 ? _a : error.message) : error);
    }
});
exports.connectDb = connectDb;
