import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Role from "../model/Role";
import User from "../model/User";
import { createToken } from "../utils/token/createToken";
const registerUserController = async (req: Request, res: Response) => {
  const transaction = await User.sequelize.transaction();

  try {
    const { email, password, first_name, middle_name, last_name, isUser } =
      req.body;

    // Create the user within the transaction
    const user = await User.create(
      {
        email,
        password,
        first_name,
        middle_name,
        last_name,
        isUser,
      },
      { transaction }
    );

    // Determine the role ID
    let roleId;
    if (req.body.isAdmin) {
      roleId = 1; // Assuming '1' is the role ID for admins
    } else if (isUser) {
      roleId = 3; // Assuming '3' is the role ID for normal users
    } else {
      roleId = 2; // Assuming '2' is the role ID for other roles
    }

    // Find the role within the transaction
    const role = await Role.findByPk(roleId, { transaction });
    if (role) {
      // Assign the role to the user
      await user.addRole(role, { transaction }); // Use `addRole` for a single role
    } else {
      throw new Error(`Role with id ${roleId} not found`);
    }
    // Commit the transaction if everything is successful
    await transaction.commit();
    formatApiResponse(
      null,
      1,
      "User registered successfully",
      res?.status(201)
    );
  } catch (error) {
    // Rollback the transaction if any error occurs
    await transaction.rollback();
    formatApiResponse(null, 0, error.message, res?.status(400));
  }
};

const loginUserController = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      formatApiResponse(null, 0, "User not found", res?.status(404));
      return;
    }
    if (!user.isActive) {
      formatApiResponse(
        null,
        0,
        "Cannot login with this user. Please contact the owner.",
        res?.status(404)
      );
      return;
    }

    const userRole = user.isAdmin ? "Admin" : user.isUser ? "User" : "Tutor";
    const token = await createToken(user.id, userRole);
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      formatApiResponse(null, 0, "Invalid Password", res?.status(400));
      return;
    }
    const formattedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      isAdmin: user.isAdmin,
      isUser: user.isUser,
    };
    formatApiResponse(
      formattedUser,
      1,
      "User logged in successfully",
      res?.status(200),
      token.token,
      token.refreshToken
    );
  } catch (error) {
    formatApiResponse(null, 0, error.message, res?.status(400));
  }
};

const initAdminData = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const formattedUserData = {
      email: user.email,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      ...(!user.isAdmin && !user.isUser
        ? {
            isTutor: true,
          }
        : {
            isAdmin: user.isAdmin,
          }),
    };
    formatApiResponse(
      formattedUserData,
      1,
      "User Data Fetched Successfylly",
      res?.status(200)
    );
  } catch (e) {
    console.log(e);
  }
};

const getALlUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user.isAdmin) {
      formatApiResponse(null, 0, "Unauthorized", res?.status(401));
      return;
    }
    const users = await User.findAll({
      where: {
        isAdmin: false,
      },
      order: [["first_name", "ASC"]],
    });
    formatApiResponse(users, 1, "Users Fetched Successfully", res?.status(200));
  } catch (e) {
    formatApiResponse(null, 0, e.message, res?.status(400));
  }
};

const changeUserStatus = async (req: AuthenticatedRequest, res: Response) => {
  const reqUser = req.user;
  if (!reqUser.isAdmin) {
    formatApiResponse(null, 0, "Unauthorized", res?.status(401));
    return;
  }
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);

    if (!user) {
      formatApiResponse(null, 0, "User not found", res?.status(404));
      return;
    }
    if (user.isActive) {
      user.isActive = false;
    } else {
      user.isActive = true;
    }
    await user.save();
    formatApiResponse(
      null,
      1,
      "User status changed successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error.message, res?.status(400));
  }
};
export {
  changeUserStatus,
  getALlUsers,
  initAdminData,
  loginUserController,
  registerUserController,
};
