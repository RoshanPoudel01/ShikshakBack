import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../model/User";
import { formatApiResponse } from "./responseFormatter";

export interface AuthenticatedRequest extends Request {
  roles?: string[];
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
    formatApiResponse(null, 0, error?.message, res?.status(400));
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
    const userRoles = await user.getRoles();
    if (user) {
      req.user = user.toJSON();
      req.roles = userRoles?.map((role) => role.name);
      next();
    } else {
      formatApiResponse(null, 0, "User not found", res?.status(404));
    }
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

const activeUser = async (req: AuthenticatedRequest, res: Response, next) => {
  try {
    if (!req.user.isActive) {
      formatApiResponse(
        null,
        0,
        "User is not active. If you have updated your profile please wait for approval.",
        res?.status(403)
      );
      return;
    }
    next();
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};
export { activeUser, checkAuth, checkDuplicateEmail };
