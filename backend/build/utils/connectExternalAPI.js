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
exports.getMuscleWikiExercises = exports.checkMuscleWikiAPIHealth = void 0;
const index_config_1 = require("../config/index.config");
const logger_utils_1 = require("./logger.utils");
const checkMuscleWikiAPIHealth = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("https://api.musclewiki.com/health", {
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": index_config_1.appConfig.externalAPIs.muscleWiki,
            },
        });
        if (!response.ok) {
            throw new Error(`MuscleWiki API returned ${response.status}`);
        }
        logger_utils_1.logger.info("Connected to MuscleWiki API successfully");
        return response.json();
    }
    catch (error) {
        logger_utils_1.logger.error("Error connecting to MuscleWiki API:", error);
        throw error;
    }
});
exports.checkMuscleWikiAPIHealth = checkMuscleWikiAPIHealth;
const getMuscleWikiExercises = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch("https://api.musclewiki.com/exercises?limit=5&category=barbell&difficulty=intermediate", {
            headers: {
                "X-API-Key": index_config_1.appConfig.externalAPIs.muscleWiki,
            },
        });
        if (!response.ok) {
            const error = yield response.text();
            throw new Error(`MuscleWiki API returned ${response.status}: ${error}`);
        }
        logger_utils_1.logger.info("Exercises retrieved from MuscleWiki API successfully");
        return response.json();
    }
    catch (error) {
        logger_utils_1.logger.error("Error retrieving MuscleWiki exercises:", error);
        throw error;
    }
});
exports.getMuscleWikiExercises = getMuscleWikiExercises;
