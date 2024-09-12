import connection from "../database";
import Role from "./Role";
import User from "./User";

const UserRole = connection.define("userrole", {});
User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });
export default UserRole;
