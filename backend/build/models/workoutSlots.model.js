"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class WorkoutSlots extends sequelize_1.Model {
}
WorkoutSlots.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    workout_group_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    slot_order: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    exercise_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    exercise_purpose_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    duration_seconds: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "WorkoutSlots",
    tableName: "workout_slots",
    timestamps: true,
});
exports.default = WorkoutSlots;
