"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const connectDb_1 = require("../config/connectDb");
const applyAssociations = () => {
    const exercisesModel = connectDb_1.db.models.Exercises;
    const musclesModel = connectDb_1.db.models.Muscles;
    const constraintsModel = connectDb_1.db.models.Constraints;
    const exerciseMusclesModel = connectDb_1.db.models.ExerciseMuscles;
    const exerciseConstraintsModel = connectDb_1.db.models.ExerciseConstraints;
    if (exercisesModel && musclesModel && exerciseMusclesModel) {
        exercisesModel.belongsToMany(musclesModel, {
            through: exerciseMusclesModel,
            foreignKey: "exercise_id",
            otherKey: "muscle_id",
            as: "muscles",
        });
        musclesModel.belongsToMany(exercisesModel, {
            through: exerciseMusclesModel,
            foreignKey: "muscle_id",
            otherKey: "exercise_id",
            as: "exercises",
        });
    }
    if (exercisesModel && constraintsModel && exerciseConstraintsModel) {
        exercisesModel.belongsToMany(constraintsModel, {
            through: exerciseConstraintsModel,
            foreignKey: "exercise_id",
            otherKey: "constraint_id",
            as: "constraints",
        });
        constraintsModel.belongsToMany(exercisesModel, {
            through: exerciseConstraintsModel,
            foreignKey: "constraint_id",
            otherKey: "exercise_id",
            as: "exercises",
        });
    }
};
applyAssociations();
const Associations = {
    name: "Associations",
};
exports.default = Associations;
