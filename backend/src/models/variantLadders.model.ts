import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type VariantLadderStatus = "draft" | "active" | "archived";

class VariantLadders extends Model {
  public id!: string;
  public slug!: string;
  public movement_family_id!: string | null;
  public name!: string;
  public description!: string;
  public status!: VariantLadderStatus;
  public review_notes!: string | null;
  public items?: unknown[];
  public createdAt!: Date;
  public updatedAt!: Date;
}

VariantLadders.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    movement_family_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "movement_families",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "archived"),
      allowNull: false,
      defaultValue: "draft",
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "VariantLadders",
    tableName: "variant_ladders",
    timestamps: true,
  },
);

export default VariantLadders;
