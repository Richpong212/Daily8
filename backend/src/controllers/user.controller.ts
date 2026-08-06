import { Request, Response } from "express";
import { createHash, randomBytes } from "crypto";
import { Op, UniqueConstraintError } from "sequelize";
import { logger } from "../utils/logger.utils";
import { comparePassword, hashPassword } from "../utils/passwordHashing";
import User from "../models/user.model";
import PasswordReset from "../models/passwordReset.model";
import { genToken } from "../utils/token";
import { passwordResetEmail } from "../services/PasswordResetEmail.template";
import { sendEmail } from "../utils/sendEmail";
import { appConfig } from "../config/index.config";
import { apiMessages } from "../utils/apiMessages";

const toClientUser = (user: User) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  isAdmin: user.isAdmin,
});

const setAuthCookie = (res: Response, user: User) => {
  const token = genToken({ userId: user.id }, appConfig.app.loginTokenTtl);

  res.cookie(appConfig.app.cookieName, token, {
    httpOnly: true,
    secure:
      appConfig.app.mode === "production" ||
      appConfig.app.cookieSameSite === "none",
    sameSite: appConfig.app.cookieSameSite,
    maxAge: appConfig.app.authCookieMaxAgeMs,
    path: "/",
  });
};

const clearAuthCookie = (res: Response) => {
  res.clearCookie(appConfig.app.cookieName, {
    httpOnly: true,
    secure:
      appConfig.app.mode === "production" ||
      appConfig.app.cookieSameSite === "none",
    sameSite: appConfig.app.cookieSameSite,
    path: "/",
  });
};

export const registerUser: any = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res.status(400).json({ message: apiMessages.invalidRequest });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ where: { email: normalizedEmail } });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: await hashPassword(password),
      isAdmin: false,
    });

    setAuthCookie(res, user);

    return res.status(201).json({
      message: "Registration successful",
      user: toClientUser(user),
    });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ message: "User already exists with this email" });
    }

    logger.error("Error registering user:", error);
    return res.status(500).json({ message: apiMessages.internalError });
  }
};

export const loginUser: any = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: apiMessages.passOrEmailRequired });
    }

    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    if (!user) {
      return res.status(401).json({ message: apiMessages.authRequired });
    }

    const passwordMatches = await comparePassword(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({ message: apiMessages.authRequired });
    }

    setAuthCookie(res, user);

    return res.status(200).json({
      message: "Login successful",
      user: toClientUser(user),
    });
  } catch (error) {
    logger.error("Error logging in user:", error);
    return res.status(500).json({ message: apiMessages.internalError });
  }
};

export const getOwnProfile: any = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: apiMessages.authRequired });
  }

  return res.status(200).json({
    message: "Session loaded",
    user: req.currentUser,
  });
};

export const logoutUser: any = async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return res.status(200).json({ message: "Logged out" });
};

export const requestPasswordReset: any = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };

    if (!email) {
      return res.status(400).json({ message: apiMessages.invalidRequest });
    }

    const genericResponse = {
      message: "If the email is registered, a password reset link has been sent.",
    };
    const user = await User.findOne({ where: { email: email.trim().toLowerCase() } });

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await PasswordReset.destroy({ where: { user_id: user.id } });
    await PasswordReset.create({
      user_id: user.id,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    await sendEmail({
      email: user.email,
      ...passwordResetEmail(user.name, rawToken),
    });

    return res.status(200).json(genericResponse);
  } catch (error) {
    logger.error("Error requesting password reset:", error);
    return res.status(500).json({ message: apiMessages.internalError });
  }
};

export const resetPassword: any = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body as { password?: string };

    if (!token || Array.isArray(token) || !password) {
      return res.status(400).json({ message: apiMessages.invalidRequest });
    }

    const tokenHash = createHash("sha256").update(token).digest("hex");
    const passwordReset = await PasswordReset.findOne({
      where: {
        token_hash: tokenHash,
        expires_at: {
          [Op.gt]: new Date(),
        },
      },
    });

    if (!passwordReset) {
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    const user = await User.findByPk(passwordReset.user_id);

    if (!user) {
      await PasswordReset.destroy({ where: { token_hash: tokenHash } });
      return res.status(400).json({ message: "Invalid or expired reset link" });
    }

    await user.update({ password: await hashPassword(password) });
    await PasswordReset.destroy({ where: { user_id: user.id } });
    clearAuthCookie(res);

    return res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    logger.error("Error resetting password:", error);
    return res.status(500).json({ message: apiMessages.internalError });
  }
};
