import { Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";

const testController = async (req: Request, res: Response) => {
  formatApiResponse(
    [
      {
        message: "Hello World!",
      },
      {
        message: "Hello World!",
      },
    ],
    1,
    null,
    res
  );
};

export { testController };
