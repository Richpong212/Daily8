import User from "./user.model";
import Exercises from "./exercises.model";
import MovementFamilies from "./movementFamilies.model";
import BodyRegions from "./bodyRegions.model";
import ExerciseBenefits from "./exerciseBenefits.model";
import Muscles from "./muscles.model";
import ExerciseMuscles from "./exerciseMuscles.model";
import Equipment from "./equipment.model";
import ExerciseEquipment from "./exerciseEquipment.model";
import Constraints from "./constraints.model";
import ExerciseConstraints from "./exerciseConstraints.model";
import ExerciseMedia from "./exerciseMedia.model";
import Workouts from "./workouts.model";
import WorkoutGroups from "./workoutGroups.model";
import WorkoutSlots from "./workoutSlots.model";
import VariantLadders from "./variantLadders.model";
import VariantLadderItems from "./variantLadderItems.model";
import ExerciseVariants from "./exerciseVariants.model";

export const applyModelAssociations = () => {
  MovementFamilies.hasMany(Exercises, {
    foreignKey: "movement_family_id",
    as: "exercises",
  });

  Exercises.belongsTo(MovementFamilies, {
    foreignKey: "movement_family_id",
    as: "movementFamily",
  });

  BodyRegions.hasMany(Exercises, {
    foreignKey: "body_region_id",
    as: "exercises",
  });

  Exercises.belongsTo(BodyRegions, {
    foreignKey: "body_region_id",
    as: "bodyRegion",
  });

  ExerciseBenefits.hasMany(Exercises, {
    foreignKey: "required_benefit_id",
    as: "exercises",
  });

  Exercises.belongsTo(ExerciseBenefits, {
    foreignKey: "required_benefit_id",
    as: "exerciseBenefit",
  });

  BodyRegions.hasMany(Muscles, {
    foreignKey: "body_region_id",
    as: "muscles",
  });

  Muscles.belongsTo(BodyRegions, {
    foreignKey: "body_region_id",
    as: "bodyRegion",
  });

  Exercises.belongsToMany(Muscles, {
    through: ExerciseMuscles,
    foreignKey: "exercise_id",
    otherKey: "muscle_id",
    as: "muscles",
  });

  Muscles.belongsToMany(Exercises, {
    through: ExerciseMuscles,
    foreignKey: "muscle_id",
    otherKey: "exercise_id",
    as: "exercises",
  });

  Exercises.belongsToMany(Equipment, {
    through: ExerciseEquipment,
    foreignKey: "exercise_id",
    otherKey: "equipment_id",
    as: "equipment",
  });

  Equipment.belongsToMany(Exercises, {
    through: ExerciseEquipment,
    foreignKey: "equipment_id",
    otherKey: "exercise_id",
    as: "exercises",
  });

  Exercises.belongsToMany(Constraints, {
    through: ExerciseConstraints,
    foreignKey: "exercise_id",
    otherKey: "constraint_id",
    as: "constraints",
  });

  Constraints.belongsToMany(Exercises, {
    through: ExerciseConstraints,
    foreignKey: "constraint_id",
    otherKey: "exercise_id",
    as: "exercises",
  });

  Exercises.hasMany(ExerciseMedia, {
    foreignKey: "exercise_id",
    as: "media",
  });

  ExerciseMedia.belongsTo(Exercises, {
    foreignKey: "exercise_id",
    as: "exercise",
  });

  MovementFamilies.hasMany(VariantLadders, {
    foreignKey: "movement_family_id",
    as: "variantLadders",
  });

  VariantLadders.belongsTo(MovementFamilies, {
    foreignKey: "movement_family_id",
    as: "movementFamily",
  });

  VariantLadders.belongsToMany(Exercises, {
    through: VariantLadderItems,
    foreignKey: "variant_ladder_id",
    otherKey: "exercise_id",
    as: "exercises",
  });

  Exercises.belongsToMany(VariantLadders, {
    through: VariantLadderItems,
    foreignKey: "exercise_id",
    otherKey: "variant_ladder_id",
    as: "variantLadders",
  });

  VariantLadders.hasMany(VariantLadderItems, {
    foreignKey: "variant_ladder_id",
    as: "items",
  });

  VariantLadderItems.belongsTo(VariantLadders, {
    foreignKey: "variant_ladder_id",
    as: "variantLadder",
  });

  Exercises.hasMany(VariantLadderItems, {
    foreignKey: "exercise_id",
    as: "variantLadderItems",
  });

  VariantLadderItems.belongsTo(Exercises, {
    foreignKey: "exercise_id",
    as: "exercise",
  });

  Exercises.hasMany(ExerciseVariants, {
    foreignKey: "from_exercise_id",
    as: "outgoingVariants",
  });

  Exercises.hasMany(ExerciseVariants, {
    foreignKey: "to_exercise_id",
    as: "incomingVariants",
  });

  ExerciseVariants.belongsTo(Exercises, {
    foreignKey: "from_exercise_id",
    as: "fromExercise",
  });

  ExerciseVariants.belongsTo(Exercises, {
    foreignKey: "to_exercise_id",
    as: "toExercise",
  });

  Workouts.hasMany(Workouts, {
    foreignKey: "previous_version_id",
    as: "nextVersions",
  });

  Workouts.belongsTo(Workouts, {
    foreignKey: "previous_version_id",
    as: "previousVersion",
  });

  Workouts.hasMany(WorkoutGroups, {
    foreignKey: "workout_id",
    as: "groups",
  });

  WorkoutGroups.belongsTo(Workouts, {
    foreignKey: "workout_id",
    as: "workout",
  });

  WorkoutGroups.hasMany(WorkoutSlots, {
    foreignKey: "workout_group_id",
    as: "slots",
  });

  WorkoutSlots.belongsTo(WorkoutGroups, {
    foreignKey: "workout_group_id",
    as: "workoutGroup",
  });

  Exercises.hasMany(WorkoutSlots, {
    foreignKey: "exercise_id",
    as: "workoutSlots",
  });

  WorkoutSlots.belongsTo(Exercises, {
    foreignKey: "exercise_id",
    as: "exercise",
  });

  ExerciseBenefits.hasMany(WorkoutSlots, {
    foreignKey: "required_benefit_id",
    as: "workoutSlots",
  });

  WorkoutSlots.belongsTo(ExerciseBenefits, {
    foreignKey: "required_benefit_id",
    as: "requiredBenefit",
  });

  void User;
};
