import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

class Equipment extends Model {
  public id!: string;
  public slug!: string;
  public name!: string;
  public description!: string | null;
  public sort_order!: number;
  public exercises?: unknown[];
  public createdAt!: Date;
  public updatedAt!: Date;
}

Equipment.init(
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
      allowNull: true,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: db,
    modelName: "Equipment",
    tableName: "equipment",
    timestamps: true,
  },
);

export default Equipment;
