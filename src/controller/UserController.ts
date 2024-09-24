import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Role from "../model/Role";
import User from "../model/User";
import UserProfile from "../model/UserProfile";
import { createToken } from "../utils/token/createToken";
const registerUserController = async (req: Request, res: Response) => {
  const transaction = await User.sequelize.transaction();

  try {
    const {
      email,
      password,
      first_name,
      middle_name,
      last_name,
      isUser,
      isAdmin,
    } = req.body;

    const userExists = await User.findOne({
      where: {
        email,
      },
    });

    // Create the user within the transaction
    const user = await User.create(
      {
        email,
        password,
        first_name,
        middle_name,
        last_name,
        isUser,
        isAdmin,
      },
      { transaction }
    );

    // Determine the role ID
    let roleId;
    if (isAdmin) {
      roleId = 1; //  '1' is the role ID for Admin
    } else if (isUser) {
      roleId = 3; //  '3' is the role ID for Students
    } else {
      roleId = 2; //  '2' is the role ID for Tutors
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
    const { email, password, isUser } = req.body;
    const user = await User.findOne({
      where: {
        email,
        isUser,
      },
    });
    if (!user) {
      formatApiResponse(
        null,
        0,
        "User with the email not found",
        res?.status(404)
      );
      return;
    }
    if (!user.isActive) {
      formatApiResponse(
        null,
        0,
        "Cannot login with this user. Please contact admin.",
        res?.status(404)
      );
      return;
    }
    const userRoles = await user.getRoles();

    const userRole = userRoles?.map((role) => role.name);
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
    const isProfileCreated = await UserProfile.findOne({
      where: {
        userId: user.id,
      },
    });

    const formattedUserData = {
      email: user.email,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
      profileCreated: isProfileCreated ? true : false,
      ...(!user.isAdmin && !user.isUser
        ? {
            isTutor: true,
          }
        : {
            isAdmin: user.isAdmin,
          }),
      userProfile: isProfileCreated,
    };
    formatApiResponse(
      formattedUserData,
      1,
      "User Data Fetched Successfylly",
      res?.status(200)
    );
  } catch (e) {
    console.error(e);
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
      include: [
        {
          model: UserProfile,
          attributes: [
            "address",
            "phoneNumber",
            "profilePicture",
            "document",
            "dateOfBirth",
          ],
        },
      ],
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

//add user profile

const saveUserProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const roles = req.roles;
    const isTutor = roles.includes("Tutor");
    const { address, phoneNumber, dateOfBirth } = req.body;
    const profilePicture =
      req.files &&
      req.files["profilePicture"] &&
      req.files["profilePicture"][0].path;

    if (profilePicture) {
      const document =
        req.files && req.files["document"] && req.files["document"][0].path;
      if (isTutor && !document) {
        formatApiResponse(
          null,
          0,
          "Please add a document to verify",
          res?.status(400)
        );
        return;
      }
      const userProfile = await UserProfile.create({
        address,
        phoneNumber,
        profilePicture,
        document,
        dateOfBirth,
        userId: user.id,
      });
      formatApiResponse(
        userProfile,
        1,
        "User Profile Created Successfully",
        res?.status(201)
      );
    } else {
      formatApiResponse(
        null,
        0,
        "Please add a profile picture",
        res?.status(400)
      );
      return;
    }
  } catch (error) {
    formatApiResponse(null, 0, error.message, res?.status(400));
  }
};

const getUserByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const roles = req.roles;
    const isTutor = roles.includes("Tutor");
    if (!isTutor) {
      formatApiResponse(null, 0, "Unauthorized", res?.status(401));
      return;
    }
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        {
          model: UserProfile,
          attributes: [
            "address",
            "phoneNumber",
            "profilePicture",
            "document",
            "dateOfBirth",
          ],
        },
      ],
    });
    if (!user) {
      formatApiResponse(null, 0, "User not found", res?.status(404));
      return;
    }
    const formattedUser = {
      id: user.id,
      email: user.email,
      full_name: `${user.first_name} ${user.middle_name ?? ""} ${
        user.last_name
      }`,
      userProfile: user.UserProfile,
    };
    formatApiResponse(
      formattedUser,
      1,
      "User Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error.message, res?.status(400));
  }
};
export {
  changeUserStatus,
  getALlUsers,
  getUserByIdController,
  initAdminData,
  loginUserController,
  registerUserController,
  saveUserProfile,
};
