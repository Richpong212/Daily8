import { Router } from "express";
import {
  createExercise,
  deleteExercise,
  getExercise,
  listExercises,
  updateExercise,
} from "../controllers/exercise.controller";
import {
  createExerciseValidation,
  updateExerciseValidation,
} from "../validations/exercise.validation";
import { validate } from "../validations/index.validation";
import { cacheResponse } from "../utils/cache.utils";

const exerciseRouter = Router();

exerciseRouter.get("/", cacheResponse("exercises", 120), listExercises);
exerciseRouter.get("/:id", cacheResponse("exercises", 120), getExercise);
exerciseRouter.post("/", createExerciseValidation, validate, createExercise);
exerciseRouter.patch(
  "/:id",
  updateExerciseValidation,
  validate,
  updateExercise,
);
exerciseRouter.delete("/:id", deleteExercise);

export default exerciseRouter;
