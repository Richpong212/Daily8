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
const express_1 = __importDefault(require("express"));
const index_config_1 = require("./config/index.config");
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const logger_utils_1 = require("./utils/logger.utils");
const connectDb_1 = require("./config/connectDb");
const connectRedis_1 = require("./config/connectRedis");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const compression_1 = __importDefault(require("compression"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const workout_route_1 = __importDefault(require("./routes/workout.route"));
const exercise_route_1 = __importDefault(require("./routes/exercise.route"));
const supportingData_route_1 = __importDefault(require("./routes/supportingData.route"));
const app = (0, express_1.default)();
const port = index_config_1.appConfig.app.port;
//rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
});
//middlewares
app.use((0, morgan_1.default)("combined"));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    credentials: true,
}));
app.use((0, cookie_parser_1.default)());
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        useDefaults: true,
    },
}));
app.use(limiter);
app.use((0, compression_1.default)()); // compress response for speed
//routes//
// health check endpoint (keep only one)
app.get("/health", (_req, res) => {
    res.status(200).json({ message: "Server is healthy" });
});
//User routes
app.use("/api/v1/users", user_route_1.default);
// workout routes
app.use("/api/v1/workouts", workout_route_1.default);
// exercise routes
app.use("/api/v1/exercises", exercise_route_1.default);
// supporting data routes
app.use("/api/v1/supporting-data", supportingData_route_1.default);
app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    logger_utils_1.logger.info(`Server is running on http://${index_config_1.appConfig.app.app_host}:${port} in ${index_config_1.appConfig.app.mode} mode`);
    yield (0, connectDb_1.connectDb)();
    yield (0, connectRedis_1.connectRedis)();
}));
// Handle invalid routes
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
exports.default = app;
