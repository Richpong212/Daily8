import "../types/express";
import { RequestHandler } from "express";
import { decodeToken } from "../utils/token";
import User from "../models/user.model";
import { appConfig } from "../config/index.config";
import { apiMessages } from "../utils/apiMessages";

type AuthTokenPayload = {
  userId?: string;
};

const getAuthPayload = (token: string): AuthTokenPayload | null => {
  const decoded = decodeToken(token);

  if (!decoded || typeof decoded !== "object" || !("userId" in decoded)) {
    return null;
  }

  return decoded as AuthTokenPayload;
};

export const authenticateUser: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.[appConfig.app.cookieName];

  if (!token || typeof token !== "string") {
    res.status(401).json({ message: apiMessages.authRequired });
    return;
  }

  const payload = getAuthPayload(token);

  if (!payload?.userId) {
    res.status(401).json({ message: apiMessages.authRequired });
    return;
  }

  const user = await User.findByPk(payload.userId);

  if (!user) {
    res.status(401).json({ message: apiMessages.authRequired });
    return;
  }

  req.currentUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    isAdmin: user.isAdmin,
  };

  next();
};
