import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

class Muscles extends Model {
  public id!: string;
  public slug!: string;
  public name!: string;
  public body_region_id!: string;
  public bodyRegion?: unknown;
  public exercises?: unknown[];
  public description!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Muscles.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    body_region_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "Muscles",
    tableName: "muscles",
    timestamps: true,
  },
);

export default Muscles;
