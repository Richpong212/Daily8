import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ExerciseMediaType = "image" | "video" | "reference_link";

export type ExerciseMediaVersion =
  | "standard"
  | "gentler"
  | "progression"
  | "reference";

export type ExerciseMediaViewAngle =
  | "front"
  | "side"
  | "three_quarter"
  | "rear"
  | "unknown";

export type ExerciseMediaRightsStatus =
  | "owned"
  | "licensed"
  | "reference_only"
  | "unknown";

class ExerciseMedia extends Model {
  public id!: string;
  public exercise_id!: string;
  public media_type!: ExerciseMediaType;
  public url!: string;
  public version!: ExerciseMediaVersion;
  public view_angle!: ExerciseMediaViewAngle;
  public is_primary!: boolean;
  public source!: string;
  public rights_status!: ExerciseMediaRightsStatus;
  public external_media_id!: string | null;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ExerciseMedia.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    media_type: {
      type: DataTypes.ENUM("image", "video", "reference_link"),
      allowNull: false,
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    version: {
      type: DataTypes.ENUM("standard", "gentler", "progression", "reference"),
      allowNull: false,
      defaultValue: "standard",
    },
    view_angle: {
      type: DataTypes.ENUM("front", "side", "three_quarter", "rear", "unknown"),
      allowNull: false,
      defaultValue: "unknown",
    },
    is_primary: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rights_status: {
      type: DataTypes.ENUM("owned", "licensed", "reference_only", "unknown"),
      allowNull: false,
      defaultValue: "unknown",
    },
    external_media_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize: db,
    modelName: "ExerciseMedia",
    tableName: "exercise_media",
    timestamps: true,
  },
);

export default ExerciseMedia;
