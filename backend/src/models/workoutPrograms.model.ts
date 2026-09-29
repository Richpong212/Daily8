import { DataTypes, Model } from "sequelize";
import { db } from "../config/connectDb";

export type WorkoutProgramStatus = "draft" | "active" | "retired";

class WorkoutPrograms extends Model {
  public id!: string;
  public slug!: string;
  public name!: string;
  public version_number!: number;
  public previous_version_id!: string | null;
  public status!: WorkoutProgramStatus;
  public notes!: string | null;
  public published_at!: Date | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

WorkoutPrograms.init(
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
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    previous_version_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: "workout_programs", key: "id" },
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "retired"),
      allowNull: false,
      defaultValue: "draft",
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "WorkoutPrograms",
    tableName: "workout_programs",
    timestamps: true,
  },
);

export default WorkoutPrograms;
