import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../model/User";
import { formatApiResponse } from "./responseFormatter";

export interface AuthenticatedRequest extends Request {
  user?: any | null;
}
const checkDuplicateEmail = async (req: Request, res: Response, next) => {
  try {
    const user = await User.findOne({
      where: {
        email: req.body.email,
        isUser: true,
      },
    });

    if (user) {
      formatApiResponse(null, 0, "Email is already in use!", res?.status(400));
      return;
    }
    next();
  } catch (error) {
    formatApiResponse(null, 0, error?.errors[0]?.message, res?.status(400));
  }
};

const checkAuth = async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.headers.authorization) {
      formatApiResponse(null, 0, "Unauthorized", res?.status(401));
      return;
    }

    const authToken = req.headers.authorization.split(" ")[1];
    const userId = jwt.decode(authToken).id;
    const user = await User.findByPk(userId);
    if (user) {
      req.user = user.toJSON();
      next();
    } else {
      formatApiResponse(null, 0, "User not found", res?.status(404));
    }
  } catch (error) {
    formatApiResponse(null, 0, error?.errors[0]?.message, res?.status(400));
  }
};
export { checkAuth, checkDuplicateEmail };
