"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const user_validation_1 = require("../validations/user.validation");
const index_validation_1 = require("../validations/index.validation");
const userRouter = (0, express_1.Router)();
//POST: create a new user
userRouter.post("/signup", user_validation_1.registrationValidation, index_validation_1.validate, user_controller_1.createUser);
exports.default = userRouter;
