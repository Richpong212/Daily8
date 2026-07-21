import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ExerciseMuscleRole = "primary" | "secondary" | "stabilizer";

class ExerciseMuscles extends Model {
  public exercise_id!: string;
  public muscle_id!: string;
  public role!: ExerciseMuscleRole;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ExerciseMuscles.init(
  {
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    muscle_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    role: {
      type: DataTypes.ENUM("primary", "secondary", "stabilizer"),
      allowNull: false,
      defaultValue: "secondary",
    },
  },
  {
    sequelize: db,
    modelName: "ExerciseMuscles",
    tableName: "exercise_muscles",
    timestamps: true,
  },
);

export default ExerciseMuscles;
