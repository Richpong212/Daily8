"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const connectDb_1 = require("../config/connectDb");
class VariantLadders extends sequelize_1.Model {
}
VariantLadders.init({
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
    movement_family_id: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: true,
        references: {
            model: "movement_families",
            key: "id",
        },
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        defaultValue: "",
    },
    status: {
        type: sequelize_1.DataTypes.ENUM("draft", "active", "archived"),
        allowNull: false,
        defaultValue: "draft",
    },
    review_notes: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
    },
}, {
    sequelize: connectDb_1.db,
    modelName: "VariantLadders",
    tableName: "variant_ladders",
    timestamps: true,
});
exports.default = VariantLadders;
