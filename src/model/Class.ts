import { DataTypes } from "sequelize";
import connection from "../database";
import SubCourse from "./SubCourse";
import User from "./User";

const Class = connection.define("class", {
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
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subCourseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: SubCourse,
      key: "id",
    },
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: "id",
    },
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  joinedUsers: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
  },
  currentlyJoinedUsers: {
    type: DataTypes.ARRAY(DataTypes.INTEGER),
    defaultValue: [],
  },
});

Class.belongsTo(SubCourse, { foreignKey: "subCourseId" });
SubCourse.hasMany(Class, { foreignKey: "subCourseId" });

Class.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(Class, { foreignKey: "createdBy" });
export default Class;
