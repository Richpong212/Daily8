"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class ExerciseEquipment extends sequelize_1.Model {
}
ExerciseEquipment.init({
    exercise_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    equipment_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    requirement_type: {
        type: sequelize_1.DataTypes.ENUM("required", "optional", "comfort_optional"),
        allowNull: false,
        defaultValue: "required",
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "ExerciseEquipment",
    tableName: "exercise_equipment",
    timestamps: true,
});
exports.default = ExerciseEquipment;
