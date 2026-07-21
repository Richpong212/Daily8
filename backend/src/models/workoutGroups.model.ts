import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

class WorkoutGroups extends Model {
  public id!: string;
  public workout_id!: string;
  public workout?: unknown;
  public slots?: unknown[];
  public group_order!: number;
  public name!: string;
  public repeat_count!: number;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

WorkoutGroups.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    workout_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    group_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    repeat_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "WorkoutGroups",
    tableName: "workout_groups",
    timestamps: true,
  },
);

export default WorkoutGroups;
