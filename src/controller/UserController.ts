import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import User from "../model/User";
import { createToken } from "../utils/token/createToken";
const registerUserController = async (req: Request, res: Response) => {
  try {
    const { email, password, first_name, middle_name, last_name } = req.body;

    const user = await User.create({
      email,
      password,
      first_name,
      middle_name,
      last_name,
    });
    const formattedUser = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      middle_name: user.middle_name,
      last_name: user.last_name,
    };
    formatApiResponse(
      formattedUser,
      1,
      "User Created Successfully",
      res?.status(201)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.errors[0]?.message, res?.status(400));
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
    const token = await createToken(user.id);

    if (!user) {
      formatApiResponse(null, 0, "User not found", res?.status(404));
      return;
    }
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
      token
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.errors[0]?.message, res?.status(400));
  }
};
export { loginUserController, registerUserController };
