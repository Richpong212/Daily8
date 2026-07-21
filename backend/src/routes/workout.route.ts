import { Router } from "express";
import {
  createWorkout,
  deleteWorkout,
  getWorkout,
  getWorkoutById,
  listWorkouts,
  updateWorkout,
} from "../controllers/workout.controller";
import { cacheResponse } from "../utils/cache.utils";

const workoutRouter = Router();

workoutRouter.get("/", cacheResponse("workouts", 120), listWorkouts);
workoutRouter.get("/api-external", cacheResponse("workouts", 300), getWorkout);
workoutRouter.get("/:id", cacheResponse("workouts", 120), getWorkoutById);
workoutRouter.post("/", createWorkout);
workoutRouter.patch("/:id", updateWorkout);
workoutRouter.delete("/:id", deleteWorkout);

export default workoutRouter;
