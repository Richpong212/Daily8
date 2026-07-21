import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ConstraintCategory =
  | "body_area"
  | "movement_demand"
  | "environment";

class Constraints extends Model {
  public id!: string;
  public slug!: string;
  public name!: string;
  public description!: string;
  public category!: ConstraintCategory;
  public sort_order!: number;
  public exercises?: unknown[];
  public createdAt!: Date;
  public updatedAt!: Date;
}

Constraints.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM("body_area", "movement_demand", "environment"),
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: db,
    modelName: "Constraints",
    tableName: "constraints",
    timestamps: true,
  },
);

export default Constraints;
