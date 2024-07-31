import { DataTypes } from "sequelize";
import connection from "../database";
import User from "./User";

const Token = connection.define("token", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  refreshToken: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiry: {
    type: DataTypes.DATE,
    allowNull: false,
  },
});
Token.belongsTo(User, { foreignKey: "userId" });

//create so that user token gets deleted on logout
User.hasMany(Token, { foreignKey: "userId" });
export default Token;
