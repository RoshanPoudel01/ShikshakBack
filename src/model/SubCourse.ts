import { DataTypes } from "sequelize";
import connection from "../database";
import Course from "./Course";
import User from "./User";

const SubCourse = connection.define("subcourse", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Course,
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
});

SubCourse.belongsTo(Course, { foreignKey: "courseId" });
Course.hasMany(SubCourse, { foreignKey: "courseId" });

SubCourse.belongsTo(User, { foreignKey: "createdBy" });
User.hasMany(SubCourse, { foreignKey: "createdBy" });
export default SubCourse;
