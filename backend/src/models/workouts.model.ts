import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type WorkoutDifficultyBand = "gentle" | "standard" | "challenging";

export type WorkoutStatus = "draft" | "active" | "retired";

class Workouts extends Model {
  public id!: string;
  public slug!: string;
  public name!: string;
  public description!: string;
  public version_number!: number;
  public previous_version_id!: string | null;
  public previousVersion?: Workouts | null;
  public nextVersions?: Workouts[];
  public published_at!: Date | null;
  public transition_seconds!: number;
  public is_new_user_friendly!: boolean;
  public difficulty_band!: WorkoutDifficultyBand;
  public status!: WorkoutStatus;
  public groups?: unknown[];
  public review_notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Workouts.init(
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
    version_number: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    previous_version_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "workouts",
        key: "id",
      },
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    transition_seconds: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
    },
    is_new_user_friendly: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    difficulty_band: {
      type: DataTypes.ENUM("gentle", "standard", "challenging"),
      allowNull: false,
      defaultValue: "standard",
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "retired"),
      allowNull: false,
      defaultValue: "draft",
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "Workouts",
    tableName: "workouts",
    timestamps: true,
  },
);

export default Workouts;
