import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ExerciseVariantType =
  | "progression"
  | "regression"
  | "alternative"
  | "related";

class ExerciseVariants extends Model {
  public id!: string;
  public from_exercise_id!: string;
  public to_exercise_id!: string;
  public variant_type!: ExerciseVariantType;
  public sort_order!: number;
  public notes!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ExerciseVariants.init(
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
    variant_type: {
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
    modelName: "ExerciseVariants",
    tableName: "exercise_variants",
    timestamps: true,
  },
);

export default ExerciseVariants;
