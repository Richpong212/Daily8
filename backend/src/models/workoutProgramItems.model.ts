import { DataTypes, Model } from "sequelize";
import { db } from "../config/connectDb";

class WorkoutProgramItems extends Model {
  public id!: string;
  public workout_program_id!: string;
  public workout_id!: string;
  public program_order!: number;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

WorkoutProgramItems.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    workout_program_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "workout_programs", key: "id" },
    },
    workout_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "workouts", key: "id" },
    },
    program_order: {
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
    modelName: "WorkoutProgramItems",
    tableName: "workout_program_items",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["workout_program_id", "program_order"] },
    ],
  },
);

export default WorkoutProgramItems;
