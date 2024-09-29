import { DataTypes } from "sequelize";
import connection from "../database";
import Class from "./Class";
import User from "./User";

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
    type: DataTypes.INTEGER,
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
});
Payment.belongsTo(Class, { foreignKey: "classId" });
Payment.belongsTo(User, { foreignKey: "userId" });
Class.hasOne(Payment, { foreignKey: "classId" });
User.hasMany(Payment, { foreignKey: "userId" });
export default Payment;
