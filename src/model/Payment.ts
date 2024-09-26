import { DataTypes } from "sequelize";
import connection from "../database";
import Class from "./Class";

const Payment = connection.define("payment", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  txnId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  classId: {
    type: DataTypes.STRING,
    allowNull: false,
    references: {
      model: Class,
      key: "id",
    },
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
export default Payment;
