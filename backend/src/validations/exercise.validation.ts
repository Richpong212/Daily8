import { body } from "express-validator";

const levels = ["none", "low", "moderate", "high"];
const exerciseStatuses = ["draft", "active", "retired"];
const variantTypes = ["progression", "regression", "alternative", "related"];
const reviewStatuses = [
  "draft",
  "needs_review",
  "reviewed",
  "approved",
  "not_recommended",
];

export const createExerciseValidation = [
  body("slug").optional().isString().trim(),
  body("name").optional().isString().trim(),
  body("movement_family_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Movement family must be a valid UUID"),
  body("body_region_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Body region must be a valid UUID"),
  body("exercise_purpose_id")
    .optional({ nullable: true })
    .isUUID()
    .withMessage("Exercise purpose must be a valid UUID"),
  body("category")
    .optional()
    .isIn(["strength", "mobility", "conditioning", "balance"])
    .withMessage("Invalid exercise category"),
  body("position")
    .optional()
    .isIn([
      "standing",
      "seated_chair",
      "seated_floor",
      "supine",
      "prone",
      "quadruped",
      "kneeling",
      "side_lying",
    ])
    .withMessage("Invalid exercise position"),
  body("impact_level").optional().isIn(levels).withMessage("Invalid impact level"),
  body("complexity_level").optional().isIn(levels).withMessage("Invalid complexity level"),
  body("intensity_level").optional().isIn(levels).withMessage("Invalid intensity level"),
  body("balance_demand").optional().isIn(levels).withMessage("Invalid balance demand"),
  body("space_need")
    .optional()
    .isIn(["small", "medium", "large"])
    .withMessage("Invalid space need"),
  body("summary").optional().isString().withMessage("Summary must be a string"),
  body("instructions").optional().isArray().withMessage("Instructions must be an array"),
  body("coaching_cues")
    .optional()
    .isArray()
    .withMessage("Coaching cues must be an array"),
  body("safety_info").optional({ nullable: true }).isString(),
  body("review_status")
    .optional()
    .isIn(reviewStatuses)
    .withMessage("Invalid review status"),
  body("review_notes").optional({ nullable: true }).isString(),
  body("status")
    .optional()
    .isIn(exerciseStatuses)
    .withMessage("Invalid exercise status"),
  body("color").optional().isString(),
  body("muscles").optional().isArray().withMessage("Muscles must be an array"),
  body("muscles.*.muscle_id")
    .optional()
    .isUUID()
    .withMessage("Muscle id must be a valid UUID"),
  body("muscles.*.role")
    .optional()
    .isIn(["primary", "secondary", "stabilizer"])
    .withMessage("Invalid muscle role"),
  body("equipment").optional().isArray().withMessage("Equipment must be an array"),
  body("equipment.*.equipment_id")
    .optional()
    .isUUID()
    .withMessage("Equipment id must be a valid UUID"),
  body("equipment.*.requirement_type")
    .optional()
    .isIn(["required", "optional", "comfort_optional"])
    .withMessage("Invalid equipment requirement type"),
  body("constraints")
    .optional()
    .isArray()
    .withMessage("Constraints must be an array"),
  body("constraints.*.constraint_id")
    .optional()
    .isUUID()
    .withMessage("Constraint id must be a valid UUID"),
  body("constraints.*.level")
    .optional()
    .isIn(levels)
    .withMessage("Invalid constraint level"),
  body("media").optional().isArray().withMessage("Media must be an array"),
  body("media.*.media_type")
    .optional()
    .isIn(["image", "video", "reference_link"])
    .withMessage("Invalid media type"),
  body("media.*.url")
    .optional()
    .isString()
    .withMessage("Media URL must be a string"),
  body("variants").optional().isArray().withMessage("Variants must be an array"),
  body("variants.*.to_exercise_id")
    .optional()
    .isUUID()
    .withMessage("Variant exercise id must be a valid UUID"),
  body("variants.*.variant_type")
    .optional()
    .isIn(variantTypes)
    .withMessage("Invalid variant type"),
  body("variants.*.sort_order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Variant sort order must be a positive integer"),
  body("variants.*.notes")
    .optional({ nullable: true })
    .isString()
    .withMessage("Variant notes must be a string"),
];

export const updateExerciseValidation = createExerciseValidation;
