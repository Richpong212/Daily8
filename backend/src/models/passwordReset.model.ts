import { Model, DataTypes } from "sequelize";
import { db } from "../config/connectDb";

class PasswordReset extends Model {
  public id!: string;
  public user_id!: string;
  public token_hash!: string;
  public expires_at!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
}

PasswordReset.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
    },
    token_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize: db,
    modelName: "PasswordReset",
    tableName: "password_resets",
    timestamps: true,
  },
);

export default PasswordReset;
