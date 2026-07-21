import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ExerciseConstraintLevel = "none" | "low" | "moderate" | "high";

class ExerciseConstraints extends Model {
  public exercise_id!: string;
  public constraint_id!: string;
  public level!: ExerciseConstraintLevel;
  public editor_notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ExerciseConstraints.init(
  {
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    constraint_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    level: {
      type: DataTypes.ENUM("none", "low", "moderate", "high"),
      allowNull: false,
      defaultValue: "low",
    },
    editor_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "ExerciseConstraints",
    tableName: "exercise_constraints",
    timestamps: true,
  },
);

export default ExerciseConstraints;
