import { Router } from "express";
import {
  createWorkout,
  deleteWorkout,
  getWorkout,
  getWorkoutById,
  listWorkouts,
  updateWorkout,
} from "../controllers/workout.controller";
import {
  createWorkoutValidation,
  updateWorkoutValidation,
} from "../validations/workout.validation";
import { validate } from "../validations/index.validation";
import { cacheResponse } from "../utils/cache.utils";

const workoutRouter = Router();

workoutRouter.get("/", cacheResponse("workouts", 120), listWorkouts);
workoutRouter.get("/api-external", cacheResponse("workouts", 300), getWorkout);
workoutRouter.get("/:id", cacheResponse("workouts", 120), getWorkoutById);
workoutRouter.post("/", createWorkoutValidation, validate, createWorkout);
workoutRouter.patch("/:id", updateWorkoutValidation, validate, updateWorkout);
workoutRouter.delete("/:id", deleteWorkout);

export default workoutRouter;
