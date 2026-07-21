"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class ExerciseConstraints extends sequelize_1.Model {
}
ExerciseConstraints.init({
    exercise_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    constraint_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    level: {
        type: sequelize_1.DataTypes.ENUM("none", "low", "moderate", "high"),
        allowNull: false,
        defaultValue: "low",
    },
    editor_notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "ExerciseConstraints",
    tableName: "exercise_constraints",
    timestamps: true,
});
exports.default = ExerciseConstraints;
