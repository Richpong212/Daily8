"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class ExerciseMedia extends sequelize_1.Model {
}
ExerciseMedia.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    exercise_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
    },
    media_type: {
        type: sequelize_1.DataTypes.ENUM("image", "video", "reference_link"),
        allowNull: false,
    },
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    version: {
        type: sequelize_1.DataTypes.ENUM("standard", "gentler", "progression", "reference"),
        allowNull: false,
        defaultValue: "standard",
    },
    view_angle: {
        type: sequelize_1.DataTypes.ENUM("front", "side", "three_quarter", "rear", "unknown"),
        allowNull: false,
        defaultValue: "unknown",
    },
    is_primary: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    source: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    rights_status: {
        type: sequelize_1.DataTypes.ENUM("owned", "licensed", "reference_only", "unknown"),
        allowNull: false,
        defaultValue: "unknown",
    },
    external_media_id: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "ExerciseMedia",
    tableName: "exercise_media",
    timestamps: true,
});
exports.default = ExerciseMedia;
