"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class ExerciseRelationships extends sequelize_1.Model {
}
ExerciseRelationships.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4,
    },
    from_exercise_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: "exercises",
            key: "id",
        },
    },
    to_exercise_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: "exercises",
            key: "id",
        },
    },
    relationship_type: {
        type: sequelize_1.DataTypes.ENUM("progression", "regression", "alternative", "related"),
        allowNull: false,
    },
    sort_order: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "ExerciseRelationships",
    tableName: "exercise_relationships",
    timestamps: true,
});
exports.default = ExerciseRelationships;
