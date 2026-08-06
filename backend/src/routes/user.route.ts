import { Router } from "express";
import {
  getOwnProfile,
  loginUser,
  logoutUser,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "../controllers/user.controller";
import {
  forgotPasswordValidation,
  loginValidation,
  registrationValidation,
  resetPasswordValidation,
} from "../validations/user.validation";
import { validate } from "../validations/index.validation";
import { authenticateUser } from "../middlewares/auth.middleware";

const userRouter = Router();

userRouter.post("/signup", registrationValidation, validate, registerUser);
userRouter.post("/login", loginValidation, validate, loginUser);
userRouter.post("/forgot-password", forgotPasswordValidation, validate, requestPasswordReset);
userRouter.post("/reset-password/:token", resetPasswordValidation, validate, resetPassword);
userRouter.post("/logout", logoutUser);
userRouter.get("/me", authenticateUser, getOwnProfile);

export default userRouter;
