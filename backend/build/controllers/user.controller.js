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
exports.createUser = void 0;
const logger_utils_1 = require("../utils/logger.utils");
const passwordHashing_1 = require("../utils/passwordHashing");
const user_model_1 = __importDefault(require("../models/user.model"));
const token_1 = require("../utils/token");
const VerificationEmail_template_1 = require("../services/VerificationEmail.template");
const sendEmail_1 = require("../utils/sendEmail");
// Create a new user
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Extract user data from request body
        const userData = req.body;
        //hash the password
        const hashedPassword = yield (0, passwordHashing_1.hashPassword)(userData.password);
        //check if the user already exists
        const existingUser = yield user_model_1.default.findOne({
            where: {
                email: userData.email,
            },
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists with this email",
            });
        }
        //data to be saved
        const newUser = Object.assign(Object.assign({}, userData), { password: hashedPassword });
        // generate token
        const token = (0, token_1.genToken)({ newUser }, "1h");
        //prepare email data
        const emailData = {
            email: newUser.email,
            subject: "Verify your account",
            html: (0, VerificationEmail_template_1.clientVerificationEmail)(newUser.name, token).html,
        };
        // send verification email
        yield (0, sendEmail_1.sendEmail)(emailData);
        // return res.status(201).json
        return res.status(201).json({
            message: "User created successfully",
            data: Object.assign(Object.assign({}, newUser), { token,
                emailData }),
        });
    }
    catch (error) {
        logger_utils_1.logger.error("Error creating user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
});
exports.createUser = createUser;
