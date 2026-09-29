import { body } from "express-validator";

const statuses = ["draft", "active", "retired"];

export const workoutProgramValidation = [
  body("name").optional().isString().trim().notEmpty().withMessage("Name is required"),
  body("status").optional().isIn(statuses).withMessage("Invalid program status"),
  body("notes").optional({ nullable: true }).isString(),
  body("items").optional().isArray().withMessage("Items must be an array"),
  body("items.*.workout_id")
    .isUUID()
    .withMessage("Workout id must be a valid UUID"),
  body("items.*.notes").optional({ nullable: true }).isString(),
];
