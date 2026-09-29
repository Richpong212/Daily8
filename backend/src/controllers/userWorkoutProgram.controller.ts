import { Request, Response } from "express";
import {
  enrollUserInActiveWorkoutProgram,
  getActiveUserWorkoutProgram,
} from "../services/userWorkoutPrograms.service";
import { apiMessages } from "../utils/apiMessages";
import { logger } from "../utils/logger.utils";

const toClientEnrollment = (enrollment: Awaited<ReturnType<typeof getActiveUserWorkoutProgram>>) => {
  if (!enrollment) return null;

  const data = enrollment.get({ plain: true }) as Record<string, unknown>;
  return {
    ...data,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    createdAt: undefined,
    updatedAt: undefined,
  };
};

export const getOwnWorkoutProgram: any = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: apiMessages.authRequired });
  }

  try {
    const enrollment = await getActiveUserWorkoutProgram(req.currentUser.id);
    return res.status(200).json({
      message: enrollment ? "Active program enrollment retrieved" : "No active program enrollment",
      data: toClientEnrollment(enrollment),
    });
  } catch (error) {
    logger.error("Error retrieving user workout program:", error);
    return res.status(500).json({ message: apiMessages.internalError });
  }
};

export const enrollOwnWorkoutProgram: any = async (req: Request, res: Response) => {
  if (!req.currentUser) {
    return res.status(401).json({ message: apiMessages.authRequired });
  }

  try {
    const enrollment = await enrollUserInActiveWorkoutProgram(req.currentUser.id);
    if (!enrollment) {
      return res.status(404).json({ message: "No active workout program is available" });
    }

    return res.status(200).json({
      message: "Program enrollment ready",
      data: toClientEnrollment(enrollment),
    });
  } catch (error) {
    logger.error("Error enrolling user in workout program:", error);
    return res.status(500).json({ message: apiMessages.internalError });
  }
};
