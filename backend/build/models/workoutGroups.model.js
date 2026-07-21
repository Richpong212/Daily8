"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class WorkoutGroups extends sequelize_1.Model {
}
WorkoutGroups.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    workout_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    group_order: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    repeat_count: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "WorkoutGroups",
    tableName: "workout_groups",
    timestamps: true,
});
exports.default = WorkoutGroups;
