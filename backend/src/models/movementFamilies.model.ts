import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

class MovementFamilies extends Model {
  public id!: string;
  public slug!: string;
  public name!: string;
  public description!: string;
  public sort_order!: number;
  public createdAt!: Date;
  public updatedAt!: Date;
}

MovementFamilies.init(
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
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize: db,
    modelName: "MovementFamilies",
    tableName: "movement_families",
    timestamps: true,
  },
);

export default MovementFamilies;
