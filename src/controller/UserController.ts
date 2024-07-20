import { Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import User from "../model/User";
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
    formatApiResponse(user, 1, "User Created Successfully", res?.status(201));
  } catch (error) {
    formatApiResponse(null, 0, error?.errors[0]?.message, res?.status(400));
  }
};

export { registerUserController };
