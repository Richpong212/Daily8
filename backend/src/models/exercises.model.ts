import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ExerciseCategory =
  | "strength"
  | "mobility"
  | "conditioning"
  | "balance";

export type ExercisePosition =
  | "standing"
  | "seated_chair"
  | "seated_floor"
  | "supine"
  | "prone"
  | "quadruped"
  | "kneeling"
  | "side_lying";

export type ExerciseImpactLevel = "none" | "low" | "moderate" | "high";

export type ExerciseComplexityLevel = "none" | "low" | "moderate" | "high";

export type ExerciseIntensityLevel = "none" | "low" | "moderate" | "high";

export type ExerciseBalanceDemand = "none" | "low" | "moderate" | "high";

export type ExerciseSpaceNeed = "small" | "medium" | "large";

export type ExerciseReviewStatus =
  | "draft"
  | "needs_review"
  | "reviewed"
  | "approved"
  | "not_recommended";

export type ExerciseStatus = "draft" | "active" | "retired";

export type ExerciseCoachingCue = {
  text: string;
  time_seconds?: number | null;
};

export type ExerciseInstructionGroup = {
  heading: string;
  steps: string[];
};

class Exercises extends Model {
  public id!: string;
  public slug!: string;
  public name!: string;
  public movement_family_id!: string | null;
  public body_region_id!: string | null;
  public required_benefit_id!: string | null;
  public muscles?: unknown[];
  public constraints?: unknown[];
  public category!: ExerciseCategory;
  public position!: ExercisePosition;
  public impact_level!: ExerciseImpactLevel;
  public complexity_level!: ExerciseComplexityLevel;
  public intensity_level!: ExerciseIntensityLevel;
  public balance_demand!: ExerciseBalanceDemand;
  public space_need!: ExerciseSpaceNeed;
  public summary!: string;
  public instructions!: string[];
  public instruction_groups!: ExerciseInstructionGroup[];
  public coaching_cues!: ExerciseCoachingCue[];
  public safety_info!: string | null;
  public review_status!: ExerciseReviewStatus;
  public review_notes!: string | null;
  public status!: ExerciseStatus;
  public published_at!: Date | null;
  public retired_at!: Date | null;
  public color!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
}

Exercises.init(
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
    movement_family_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    body_region_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    required_benefit_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    category: {
      type: DataTypes.ENUM("strength", "mobility", "conditioning", "balance"),
      allowNull: false,
    },
    position: {
      type: DataTypes.ENUM(
        "standing",
        "seated_chair",
        "seated_floor",
        "supine",
        "prone",
        "quadruped",
        "kneeling",
        "side_lying",
      ),
      allowNull: false,
    },
    impact_level: {
      type: DataTypes.ENUM("none", "low", "moderate", "high"),
      allowNull: false,
      defaultValue: "low",
    },
    complexity_level: {
      type: DataTypes.ENUM("none", "low", "moderate", "high"),
      allowNull: false,
      defaultValue: "low",
    },
    intensity_level: {
      type: DataTypes.ENUM("none", "low", "moderate", "high"),
      allowNull: false,
      defaultValue: "low",
    },
    balance_demand: {
      type: DataTypes.ENUM("none", "low", "moderate", "high"),
      allowNull: false,
      defaultValue: "low",
    },
    space_need: {
      type: DataTypes.ENUM("small", "medium", "large"),
      allowNull: false,
      defaultValue: "small",
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    instructions: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      allowNull: false,
      defaultValue: [],
    },
    instruction_groups: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    coaching_cues: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
    },
    safety_info: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    review_status: {
      type: DataTypes.ENUM(
        "draft",
        "needs_review",
        "reviewed",
        "approved",
        "not_recommended",
      ),
      allowNull: false,
      defaultValue: "needs_review",
    },
    review_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("draft", "active", "retired"),
      allowNull: false,
      defaultValue: "draft",
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    retired_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "#2f7a54",
    },
  },
  {
    sequelize: db,
    modelName: "Exercises",
    tableName: "exercises",
    timestamps: true,
  },
);

export default Exercises;
