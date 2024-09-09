import connection from "../database";
import Role from "./Role";
import User from "./User";

const UserRole = connection.define("userrole", {});
User.belongsToMany(Role, { through: "userrole" });
Role.belongsToMany(User, { through: "userrole" });
export default UserRole;
