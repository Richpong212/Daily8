import { DataTypes, Model } from "sequelize";
import { db } from "../config/connectDb";

export type UserWorkoutProgramStatus = "active" | "completed";

class UserWorkoutPrograms extends Model {
  public id!: string;
  public user_id!: string;
  public workout_program_id!: string;
  public status!: UserWorkoutProgramStatus;
  public started_at!: Date;
  public completed_at!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

UserWorkoutPrograms.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
    },
    workout_program_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "workout_programs", key: "id" },
    },
    status: {
      type: DataTypes.ENUM("active", "completed"),
      allowNull: false,
      defaultValue: "active",
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "UserWorkoutPrograms",
    tableName: "user_workout_programs",
    timestamps: true,
    indexes: [
      { unique: true, fields: ["user_id", "workout_program_id"] },
      {
        unique: true,
        fields: ["user_id"],
        where: { status: "active" },
        name: "user_workout_programs_one_active_per_user",
      },
    ],
  },
);

export default UserWorkoutPrograms;
