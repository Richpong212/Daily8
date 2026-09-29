import { Router } from "express";
import {
  createWorkoutProgram,
  createWorkoutProgramVersion,
  getWorkoutProgramById,
  listWorkoutPrograms,
  updateWorkoutProgram,
} from "../controllers/workoutProgram.controller";
import { cacheResponse } from "../utils/cache.utils";
import { validate } from "../validations/index.validation";
import { workoutProgramValidation } from "../validations/workoutProgram.validation";

const workoutProgramRouter = Router();

workoutProgramRouter.get("/", cacheResponse("workout-programs", 120), listWorkoutPrograms);
workoutProgramRouter.get(
  "/:id",
  cacheResponse("workout-programs", 120),
  getWorkoutProgramById,
);
workoutProgramRouter.post("/", workoutProgramValidation, validate, createWorkoutProgram);
workoutProgramRouter.post("/:id/versions", createWorkoutProgramVersion);
workoutProgramRouter.patch(
  "/:id",
  workoutProgramValidation,
  validate,
  updateWorkoutProgram,
);

export default workoutProgramRouter;
