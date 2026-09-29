import { Router } from "express";
import {
  enrollOwnWorkoutProgram,
  getOwnWorkoutProgram,
} from "../controllers/userWorkoutProgram.controller";

const userWorkoutProgramRouter = Router();

userWorkoutProgramRouter.get("/active", getOwnWorkoutProgram);
userWorkoutProgramRouter.post("/enroll", enrollOwnWorkoutProgram);

export default userWorkoutProgramRouter;
