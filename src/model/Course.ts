import { DataTypes } from "sequelize";
import connection from "../database";
import User from "./User";

const Course = connection.define("course", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  clicks: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Image URL cannot be null",
      },
    },
  },
  tags: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
});

Course.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Course, { foreignKey: "createdBy" });

export default Course;
