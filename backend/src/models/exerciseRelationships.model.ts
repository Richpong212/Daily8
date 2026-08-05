import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ExerciseRelationshipType =
  | "progression"
  | "regression"
  | "alternative"
  | "related";

class ExerciseRelationships extends Model {
  public id!: string;
  public from_exercise_id!: string;
  public to_exercise_id!: string;
  public relationship_type!: ExerciseRelationshipType;
  public sort_order!: number;
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
      type: DataTypes.ENUM("progression", "regression", "alternative", "related"),
      allowNull: false,
    },
    sort_order: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
