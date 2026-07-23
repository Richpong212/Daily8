"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateExerciseValidation = exports.createExerciseValidation = void 0;
const express_validator_1 = require("express-validator");
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
exports.createExerciseValidation = [
    (0, express_validator_1.body)("slug").optional().isString().trim(),
    (0, express_validator_1.body)("name").optional().isString().trim(),
    (0, express_validator_1.body)("movement_family_id")
        .optional({ nullable: true })
        .isUUID()
        .withMessage("Movement family must be a valid UUID"),
    (0, express_validator_1.body)("body_region_id")
        .optional({ nullable: true })
        .isUUID()
        .withMessage("Body region must be a valid UUID"),
    (0, express_validator_1.body)("exercise_purpose_id")
        .optional({ nullable: true })
        .isUUID()
        .withMessage("Exercise purpose must be a valid UUID"),
    (0, express_validator_1.body)("category")
        .optional()
        .isIn(["strength", "mobility", "conditioning", "balance"])
        .withMessage("Invalid exercise category"),
    (0, express_validator_1.body)("position")
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
    (0, express_validator_1.body)("impact_level").optional().isIn(levels).withMessage("Invalid impact level"),
    (0, express_validator_1.body)("complexity_level").optional().isIn(levels).withMessage("Invalid complexity level"),
    (0, express_validator_1.body)("intensity_level").optional().isIn(levels).withMessage("Invalid intensity level"),
    (0, express_validator_1.body)("balance_demand").optional().isIn(levels).withMessage("Invalid balance demand"),
    (0, express_validator_1.body)("space_need")
        .optional()
        .isIn(["small", "medium", "large"])
        .withMessage("Invalid space need"),
    (0, express_validator_1.body)("summary").optional().isString().withMessage("Summary must be a string"),
    (0, express_validator_1.body)("instructions").optional().isArray().withMessage("Instructions must be an array"),
    (0, express_validator_1.body)("coaching_cues")
        .optional()
        .isArray()
        .withMessage("Coaching cues must be an array"),
    (0, express_validator_1.body)("safety_info").optional({ nullable: true }).isString(),
    (0, express_validator_1.body)("review_status")
        .optional()
        .isIn(reviewStatuses)
        .withMessage("Invalid review status"),
    (0, express_validator_1.body)("review_notes").optional({ nullable: true }).isString(),
    (0, express_validator_1.body)("status")
        .optional()
        .isIn(exerciseStatuses)
        .withMessage("Invalid exercise status"),
    (0, express_validator_1.body)("color").optional().isString(),
    (0, express_validator_1.body)("muscles").optional().isArray().withMessage("Muscles must be an array"),
    (0, express_validator_1.body)("muscles.*.muscle_id")
        .optional()
        .isUUID()
        .withMessage("Muscle id must be a valid UUID"),
    (0, express_validator_1.body)("muscles.*.role")
        .optional()
        .isIn(["primary", "secondary", "stabilizer"])
        .withMessage("Invalid muscle role"),
    (0, express_validator_1.body)("equipment").optional().isArray().withMessage("Equipment must be an array"),
    (0, express_validator_1.body)("equipment.*.equipment_id")
        .optional()
        .isUUID()
        .withMessage("Equipment id must be a valid UUID"),
    (0, express_validator_1.body)("equipment.*.requirement_type")
        .optional()
        .isIn(["required", "optional", "comfort_optional"])
        .withMessage("Invalid equipment requirement type"),
    (0, express_validator_1.body)("constraints")
        .optional()
        .isArray()
        .withMessage("Constraints must be an array"),
    (0, express_validator_1.body)("constraints.*.constraint_id")
        .optional()
        .isUUID()
        .withMessage("Constraint id must be a valid UUID"),
    (0, express_validator_1.body)("constraints.*.level")
        .optional()
        .isIn(levels)
        .withMessage("Invalid constraint level"),
    (0, express_validator_1.body)("media").optional().isArray().withMessage("Media must be an array"),
    (0, express_validator_1.body)("media.*.media_type")
        .optional()
        .isIn(["image", "video", "reference_link"])
        .withMessage("Invalid media type"),
    (0, express_validator_1.body)("media.*.url")
        .optional()
        .isString()
        .withMessage("Media URL must be a string"),
    (0, express_validator_1.body)("variants").optional().isArray().withMessage("Variants must be an array"),
    (0, express_validator_1.body)("variants.*.to_exercise_id")
        .optional()
        .isUUID()
        .withMessage("Variant exercise id must be a valid UUID"),
    (0, express_validator_1.body)("variants.*.variant_type")
        .optional()
        .isIn(variantTypes)
        .withMessage("Invalid variant type"),
    (0, express_validator_1.body)("variants.*.sort_order")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Variant sort order must be a positive integer"),
    (0, express_validator_1.body)("variants.*.notes")
        .optional({ nullable: true })
        .isString()
        .withMessage("Variant notes must be a string"),
];
exports.updateExerciseValidation = exports.createExerciseValidation;
