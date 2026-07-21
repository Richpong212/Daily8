"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class VariantLadderItems extends sequelize_1.Model {
}
VariantLadderItems.init({
    variant_ladder_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "variant_ladders",
            key: "id",
        },
    },
    exercise_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        references: {
            model: "exercises",
            key: "id",
        },
    },
    position: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    is_default_anchor: {
        type: sequelize_1.DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    editor_notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "VariantLadderItems",
    tableName: "variant_ladder_items",
    timestamps: true,
});
exports.default = VariantLadderItems;
