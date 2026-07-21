import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

class WorkoutSlots extends Model {
  public id!: string;
  public workout_group_id!: string;
  public workoutGroup?: unknown;
  public slot_order!: number;
  public exercise_id!: string;
  public exercise?: unknown;
  public exercise_purpose_id!: string | null;
  public exercisePurpose?: unknown;
  public duration_seconds!: number;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

WorkoutSlots.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    workout_group_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    slot_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    exercise_purpose_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    duration_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "WorkoutSlots",
    tableName: "workout_slots",
    timestamps: true,
  },
);

export default WorkoutSlots;
