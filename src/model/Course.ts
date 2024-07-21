import { DataTypes } from "sequelize";
import connection from "../database";

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
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: "Image URL cannot be null",
      },
    },
  },
});

export default Course;
