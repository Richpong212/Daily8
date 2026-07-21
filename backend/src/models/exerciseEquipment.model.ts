import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

export type ExerciseEquipmentRequirementType =
  | "required"
  | "optional"
  | "comfort_optional";

class ExerciseEquipment extends Model {
  public exercise_id!: string;
  public equipment_id!: string;
  public requirement_type!: ExerciseEquipmentRequirementType;
  public createdAt!: Date;
  public updatedAt!: Date;
}

ExerciseEquipment.init(
  {
    exercise_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    equipment_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
    },
    requirement_type: {
      type: DataTypes.ENUM("required", "optional", "comfort_optional"),
      allowNull: false,
      defaultValue: "required",
    },
  },
  {
    sequelize: db,
    modelName: "ExerciseEquipment",
    tableName: "exercise_equipment",
    timestamps: true,
  },
);

export default ExerciseEquipment;
