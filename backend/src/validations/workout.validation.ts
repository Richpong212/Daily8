import { body } from "express-validator";

const workoutStatuses = ["draft", "active", "retired"];
const difficultyBands = ["gentle", "standard", "challenging"];

export const createWorkoutValidation = [
  body("name").optional().isString().trim(),
  body("description").optional().isString(),
  body("transition_seconds")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Transition seconds must be a positive integer"),
  body("is_new_user_friendly")
    .optional()
    .isBoolean()
    .withMessage("New user friendly must be a boolean"),
  body("difficulty_band")
    .optional()
    .isIn(difficultyBands)
    .withMessage("Invalid workout difficulty"),
  body("status").optional().isIn(workoutStatuses).withMessage("Invalid workout status"),
  body("review_notes").optional({ nullable: true }).isString(),
  body("groups").optional().isArray().withMessage("Groups must be an array"),
  body("groups.*.group_order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Group order must be a positive integer"),
  body("groups.*.name").optional().isString().withMessage("Group name must be a string"),
  body("groups.*.repeat_count")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Repeat count must be a positive integer"),
  body("groups.*.notes").optional({ nullable: true }).isString(),
  body("groups.*.slots").optional().isArray().withMessage("Slots must be an array"),
  body("groups.*.slots.*.slot_order")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Slot order must be a positive integer"),
  body("groups.*.slots.*.exercise_id")
    .optional()
    .isUUID()
    .withMessage("Exercise id must be a valid UUID"),
  body("groups.*.slots.*.required_benefit_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Exercise benefit must be a valid UUID"),
  body("groups.*.slots.*.duration_seconds")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Duration seconds must be a positive integer"),
  body("groups.*.slots.*.instruction_groups")
    .optional()
    .isArray()
    .withMessage("Instruction groups must be an array"),
  body("groups.*.slots.*.instruction_groups.*.heading")
    .optional()
    .isString()
    .withMessage("Instruction group heading must be a string"),
  body("groups.*.slots.*.instruction_groups.*.steps")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Instruction group steps must be an array"),
  body("groups.*.slots.*.instruction_groups.*.steps.*")
    .optional()
    .isString()
    .withMessage("Instruction group steps must be strings"),
  body("groups.*.slots.*.notes").optional({ nullable: true }).isString(),
];

export const updateWorkoutValidation = createWorkoutValidation;
