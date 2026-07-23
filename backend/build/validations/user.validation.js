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
exports.updateUserValidation = exports.loginValidation = exports.registrationValidation = void 0;
const express_validator_1 = require("express-validator");
// Registration validation
exports.registrationValidation = [
    (0, express_validator_1.check)("name").notEmpty().withMessage("Name is required").trim().escape(),
    (0, express_validator_1.check)("email")
        .isEmail()
        .withMessage("Invalid email")
        .notEmpty()
        .withMessage("Email is required")
        .trim()
        .escape()
        .normalizeEmail()
        .customSanitizer((value) => value.replace(/[^\x20-\x7E]/g, ""))
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        // Additional custom checks for commonly abused CVEs
        const invalidPatterns = [
            /(\b(and|or)\b\s*=\s*\b(and|or)\b)/i, // SQL tautology
            /[\^<>()[\]{};'",]/, // Potentially harmful special characters
            /(UNION\s+SELECT)/i, // SQL UNION attack
        ];
        if (invalidPatterns.some((pattern) => pattern.test(value))) {
            throw new Error("Email contains potentially harmful characters");
        }
        const bannedDomains = ["example.com", "mailinator.com", "fakeemail.com"];
        const domain = value.split("@")[1];
        if (bannedDomains.includes(domain)) {
            throw new Error("Email domain is not allowed");
        }
    })),
    (0, express_validator_1.check)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .isStrongPassword()
        .trim()
        .escape()
        .withMessage("Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 special character"),
];
// Login validation
exports.loginValidation = [
    (0, express_validator_1.check)("email")
        .isEmail()
        .notEmpty()
        .withMessage("Email is required")
        .trim()
        .escape()
        .normalizeEmail()
        .customSanitizer((value) => value.replace(/[^\x20-\x7E]/g, ""))
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        // Additional custom checks for commonly abused CVEs
        const invalidPatterns = [
            /(\b(and|or)\b\s*=\s*\b(and|or)\b)/i, // SQL tautology
            /[\^<>()[\]{};'",]/, // Potentially harmful special characters
            /(UNION\s+SELECT)/i, // SQL UNION attack
        ];
        if (invalidPatterns.some((pattern) => pattern.test(value))) {
            throw new Error("Email contains potentially harmful characters");
        }
        const bannedDomains = ["example.com", "mailinator.com", "fakeemail.com"];
        const domain = value.split("@")[1];
        if (bannedDomains.includes(domain)) {
            throw new Error("Email domain is not allowed");
        }
    })),
    (0, express_validator_1.check)("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 6 })
        .trim()
        .escape(),
];
exports.updateUserValidation = [
    (0, express_validator_1.check)("name").trim().escape(),
    (0, express_validator_1.check)("email")
        .isEmail()
        .withMessage("Invalid email")
        .trim()
        .escape()
        .normalizeEmail()
        .customSanitizer((value) => value.replace(/[^\x20-\x7E]/g, ""))
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        // Additional custom checks for commonly abused CVEs
        const invalidPatterns = [
            /(\b(and|or)\b\s*=\s*\b(and|or)\b)/i, // SQL tautology
            /[\^<>()[\]{};'",]/, // Potentially harmful special characters
            /(UNION\s+SELECT)/i, // SQL UNION attack
        ];
        if (invalidPatterns.some((pattern) => pattern.test(value))) {
            throw new Error("Email contains potentially harmful characters");
        }
        const bannedDomains = ["example.com", "mailinator.com", "fakeemail.com"];
        const domain = value.split("@")[1];
        if (bannedDomains.includes(domain)) {
            throw new Error("Email domain is not allowed");
        }
    })),
    (0, express_validator_1.check)("password")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long")
        .isStrongPassword()
        .trim()
        .escape()
        .withMessage("Password must contain at least 1 lowercase, 1 uppercase, 1 number, 1 special character"),
];
