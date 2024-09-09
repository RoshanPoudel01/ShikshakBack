import { Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import Role from "../model/Role";

const roleController = async (req: Request, res: Response) => {
  const { name } = req.body;
  const roleData = await Role.create({ name });
  formatApiResponse(roleData, 1, "Role Created Successfully", res?.status(201));
};

export { roleController };
