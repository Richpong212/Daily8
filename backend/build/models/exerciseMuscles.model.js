"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class ExerciseMuscles extends sequelize_1.Model {
}
ExerciseMuscles.init({
    exercise_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    muscle_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    role: {
        type: sequelize_1.DataTypes.ENUM("primary", "secondary", "stabilizer"),
        allowNull: false,
        defaultValue: "secondary",
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "ExerciseMuscles",
    tableName: "exercise_muscles",
    timestamps: true,
});
exports.default = ExerciseMuscles;
