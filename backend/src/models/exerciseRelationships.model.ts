import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ExerciseRelationshipType =
  | "constraint_based_swap"
  | "same_purpose_alternative";

export type ExerciseRelationshipStatus = "draft" | "active" | "retired";

class ExerciseRelationships extends Model {
  public id!: string;
  public from_exercise_id!: string;
  public to_exercise_id!: string;
  public relationship_type!: ExerciseRelationshipType;
  public constraint_id!: string | null;
  public rank!: number;
  public status!: ExerciseRelationshipStatus;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ExerciseRelationships.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    from_exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "exercises",
        key: "id",
      },
    },
    to_exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "exercises",
        key: "id",
      },
    },
    relationship_type: {
      type: DataTypes.ENUM("constraint_based_swap", "same_purpose_alternative"),
      allowNull: false,
    },
    constraint_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "constraints",
        key: "id",
      },
    },
    rank: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
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
  },
  {
    sequelize: db,
    modelName: "ExerciseRelationships",
    tableName: "exercise_relationships",
    timestamps: true,
  },
);

export default ExerciseRelationships;
