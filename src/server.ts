import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import Role from "./model/Role";
import User from "./model/User";
import UserProfile from "./model/UserProfile";
import UserRole from "./model/UserRole";
import router from "./routers";
dotenv.config();

const app = express();
const port = process.env.PORT || 3300;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: "*" }));
app.use("/uploads", express.static("uploads"));
app.use("/api", router);
app.use(express.static("public"));

User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

UserProfile.belongsTo(User, { foreignKey: "userId" });
User.hasOne(UserProfile, { foreignKey: "userId" });

app.listen(port, () => {
  return console.log(
    `Express server is listening at http://localhost:${port} 🚀`
  );
});
