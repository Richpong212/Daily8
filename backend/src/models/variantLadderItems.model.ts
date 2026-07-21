import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

class VariantLadderItems extends Model {
  public variant_ladder_id!: string;
  public exercise_id!: string;
  public position!: number;
  public is_default_anchor!: boolean;
  public editor_notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

VariantLadderItems.init(
  {
    variant_ladder_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "variant_ladders",
        key: "id",
      },
    },
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "exercises",
        key: "id",
      },
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    is_default_anchor: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    editor_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "VariantLadderItems",
    tableName: "variant_ladder_items",
    timestamps: true,
  },
);

export default VariantLadderItems;
