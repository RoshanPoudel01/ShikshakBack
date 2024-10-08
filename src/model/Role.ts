import { DataTypes } from "sequelize";
import connection from "../database";

const Role = connection.define("role", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
export default Role;
