"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyModelAssociations = void 0;
const user_model_1 = __importDefault(require("./user.model"));
const exercises_model_1 = __importDefault(require("./exercises.model"));
const movementFamilies_model_1 = __importDefault(require("./movementFamilies.model"));
const bodyRegions_model_1 = __importDefault(require("./bodyRegions.model"));
const exercisePurposes_model_1 = __importDefault(require("./exercisePurposes.model"));
const muscles_model_1 = __importDefault(require("./muscles.model"));
const exerciseMuscles_model_1 = __importDefault(require("./exerciseMuscles.model"));
const equipment_model_1 = __importDefault(require("./equipment.model"));
const exerciseEquipment_model_1 = __importDefault(require("./exerciseEquipment.model"));
const constraints_model_1 = __importDefault(require("./constraints.model"));
const exerciseConstraints_model_1 = __importDefault(require("./exerciseConstraints.model"));
const exerciseMedia_model_1 = __importDefault(require("./exerciseMedia.model"));
const workouts_model_1 = __importDefault(require("./workouts.model"));
const workoutGroups_model_1 = __importDefault(require("./workoutGroups.model"));
const workoutSlots_model_1 = __importDefault(require("./workoutSlots.model"));
const variantLadders_model_1 = __importDefault(require("./variantLadders.model"));
const variantLadderItems_model_1 = __importDefault(require("./variantLadderItems.model"));
const exerciseVariants_model_1 = __importDefault(require("./exerciseVariants.model"));
const applyModelAssociations = () => {
    movementFamilies_model_1.default.hasMany(exercises_model_1.default, {
        foreignKey: "movement_family_id",
        as: "exercises",
    });
    exercises_model_1.default.belongsTo(movementFamilies_model_1.default, {
        foreignKey: "movement_family_id",
        as: "movementFamily",
    });
    bodyRegions_model_1.default.hasMany(exercises_model_1.default, {
        foreignKey: "body_region_id",
        as: "exercises",
    });
    exercises_model_1.default.belongsTo(bodyRegions_model_1.default, {
        foreignKey: "body_region_id",
        as: "bodyRegion",
    });
    exercisePurposes_model_1.default.hasMany(exercises_model_1.default, {
        foreignKey: "exercise_purpose_id",
        as: "exercises",
    });
    exercises_model_1.default.belongsTo(exercisePurposes_model_1.default, {
        foreignKey: "exercise_purpose_id",
        as: "exercisePurpose",
    });
    bodyRegions_model_1.default.hasMany(muscles_model_1.default, {
        foreignKey: "body_region_id",
        as: "muscles",
    });
    muscles_model_1.default.belongsTo(bodyRegions_model_1.default, {
        foreignKey: "body_region_id",
        as: "bodyRegion",
    });
    exercises_model_1.default.belongsToMany(muscles_model_1.default, {
        through: exerciseMuscles_model_1.default,
        foreignKey: "exercise_id",
        otherKey: "muscle_id",
        as: "muscles",
    });
    muscles_model_1.default.belongsToMany(exercises_model_1.default, {
        through: exerciseMuscles_model_1.default,
        foreignKey: "muscle_id",
        otherKey: "exercise_id",
        as: "exercises",
    });
    exercises_model_1.default.belongsToMany(equipment_model_1.default, {
        through: exerciseEquipment_model_1.default,
        foreignKey: "exercise_id",
        otherKey: "equipment_id",
        as: "equipment",
    });
    equipment_model_1.default.belongsToMany(exercises_model_1.default, {
        through: exerciseEquipment_model_1.default,
        foreignKey: "equipment_id",
        otherKey: "exercise_id",
        as: "exercises",
    });
    exercises_model_1.default.belongsToMany(constraints_model_1.default, {
        through: exerciseConstraints_model_1.default,
        foreignKey: "exercise_id",
        otherKey: "constraint_id",
        as: "constraints",
    });
    constraints_model_1.default.belongsToMany(exercises_model_1.default, {
        through: exerciseConstraints_model_1.default,
        foreignKey: "constraint_id",
        otherKey: "exercise_id",
        as: "exercises",
    });
    exercises_model_1.default.hasMany(exerciseMedia_model_1.default, {
        foreignKey: "exercise_id",
        as: "media",
    });
    exerciseMedia_model_1.default.belongsTo(exercises_model_1.default, {
        foreignKey: "exercise_id",
        as: "exercise",
    });
    movementFamilies_model_1.default.hasMany(variantLadders_model_1.default, {
        foreignKey: "movement_family_id",
        as: "variantLadders",
    });
    variantLadders_model_1.default.belongsTo(movementFamilies_model_1.default, {
        foreignKey: "movement_family_id",
        as: "movementFamily",
    });
    variantLadders_model_1.default.belongsToMany(exercises_model_1.default, {
        through: variantLadderItems_model_1.default,
        foreignKey: "variant_ladder_id",
        otherKey: "exercise_id",
        as: "exercises",
    });
    exercises_model_1.default.belongsToMany(variantLadders_model_1.default, {
        through: variantLadderItems_model_1.default,
        foreignKey: "exercise_id",
        otherKey: "variant_ladder_id",
        as: "variantLadders",
    });
    variantLadders_model_1.default.hasMany(variantLadderItems_model_1.default, {
        foreignKey: "variant_ladder_id",
        as: "items",
    });
    variantLadderItems_model_1.default.belongsTo(variantLadders_model_1.default, {
        foreignKey: "variant_ladder_id",
        as: "variantLadder",
    });
    exercises_model_1.default.hasMany(variantLadderItems_model_1.default, {
        foreignKey: "exercise_id",
        as: "variantLadderItems",
    });
    variantLadderItems_model_1.default.belongsTo(exercises_model_1.default, {
        foreignKey: "exercise_id",
        as: "exercise",
    });
    exercises_model_1.default.hasMany(exerciseVariants_model_1.default, {
        foreignKey: "from_exercise_id",
        as: "outgoingVariants",
    });
    exercises_model_1.default.hasMany(exerciseVariants_model_1.default, {
        foreignKey: "to_exercise_id",
        as: "incomingVariants",
    });
    exerciseVariants_model_1.default.belongsTo(exercises_model_1.default, {
        foreignKey: "from_exercise_id",
        as: "fromExercise",
    });
    exerciseVariants_model_1.default.belongsTo(exercises_model_1.default, {
        foreignKey: "to_exercise_id",
        as: "toExercise",
    });
    workouts_model_1.default.hasMany(workouts_model_1.default, {
        foreignKey: "previous_version_id",
        as: "nextVersions",
    });
    workouts_model_1.default.belongsTo(workouts_model_1.default, {
        foreignKey: "previous_version_id",
        as: "previousVersion",
    });
    workouts_model_1.default.hasMany(workoutGroups_model_1.default, {
        foreignKey: "workout_id",
        as: "groups",
    });
    workoutGroups_model_1.default.belongsTo(workouts_model_1.default, {
        foreignKey: "workout_id",
        as: "workout",
    });
    workoutGroups_model_1.default.hasMany(workoutSlots_model_1.default, {
        foreignKey: "workout_group_id",
        as: "slots",
    });
    workoutSlots_model_1.default.belongsTo(workoutGroups_model_1.default, {
        foreignKey: "workout_group_id",
        as: "workoutGroup",
    });
    exercises_model_1.default.hasMany(workoutSlots_model_1.default, {
        foreignKey: "exercise_id",
        as: "workoutSlots",
    });
    workoutSlots_model_1.default.belongsTo(exercises_model_1.default, {
        foreignKey: "exercise_id",
        as: "exercise",
    });
    exercisePurposes_model_1.default.hasMany(workoutSlots_model_1.default, {
        foreignKey: "exercise_purpose_id",
        as: "workoutSlots",
    });
    workoutSlots_model_1.default.belongsTo(exercisePurposes_model_1.default, {
        foreignKey: "exercise_purpose_id",
        as: "exercisePurpose",
    });
    void user_model_1.default;
};
exports.applyModelAssociations = applyModelAssociations;
