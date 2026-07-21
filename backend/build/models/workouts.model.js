"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class Workouts extends sequelize_1.Model {
}
Workouts.init({
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
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    version_number: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
    },
    previous_version_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: "workouts",
            key: "id",
        },
    },
    published_at: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
    transition_seconds: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
    },
    is_new_user_friendly: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    difficulty_band: {
        type: sequelize_1.DataTypes.ENUM("gentle", "standard", "challenging"),
        allowNull: false,
        defaultValue: "standard",
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("draft", "active", "retired"),
        allowNull: false,
        defaultValue: "draft",
    },
    review_notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "Workouts",
    tableName: "workouts",
    timestamps: true,
});
exports.default = Workouts;
