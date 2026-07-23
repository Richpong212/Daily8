"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class Exercises extends sequelize_1.Model {
}
Exercises.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    slug: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    movement_family_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    body_region_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    exercise_purpose_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
    },
    category: {
        type: sequelize_1.DataTypes.ENUM("strength", "mobility", "conditioning", "balance"),
        allowNull: false,
    },
    position: {
        type: sequelize_1.DataTypes.ENUM("standing", "seated_chair", "seated_floor", "supine", "prone", "quadruped", "kneeling", "side_lying"),
        allowNull: false,
    },
    impact_level: {
        type: sequelize_1.DataTypes.ENUM("none", "low", "moderate", "high"),
        allowNull: false,
        defaultValue: "low",
    },
    complexity_level: {
        type: sequelize_1.DataTypes.ENUM("none", "low", "moderate", "high"),
        allowNull: false,
        defaultValue: "low",
    },
    intensity_level: {
        type: sequelize_1.DataTypes.ENUM("none", "low", "moderate", "high"),
        allowNull: false,
        defaultValue: "low",
    },
    balance_demand: {
        type: sequelize_1.DataTypes.ENUM("none", "low", "moderate", "high"),
        allowNull: false,
        defaultValue: "low",
    },
    space_need: {
        type: sequelize_1.DataTypes.ENUM("small", "medium", "large"),
        allowNull: false,
        defaultValue: "small",
    },
    summary: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    instructions: {
        type: sequelize_1.DataTypes.ARRAY(sequelize_1.DataTypes.TEXT),
        allowNull: false,
        defaultValue: [],
    },
    coaching_cues: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
    },
    safety_info: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    review_status: {
        type: sequelize_1.DataTypes.ENUM("draft", "needs_review", "reviewed", "approved", "not_recommended"),
        allowNull: false,
        defaultValue: "needs_review",
    },
    review_notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("draft", "active", "retired"),
        allowNull: false,
        defaultValue: "draft",
    },
    published_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    retired_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    color: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        defaultValue: "#2f7a54",
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "Exercises",
    tableName: "exercises",
    timestamps: true,
});
exports.default = Exercises;
