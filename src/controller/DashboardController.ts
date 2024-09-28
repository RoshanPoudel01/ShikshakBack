import { Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Class from "../model/Class";
import Course from "../model/Course";
import User from "../model/User";

const dashboardApi = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const roles = req.roles;

    if (roles.includes("Student") && roles.length === 1) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const totalCourseCount = await Course.count();
    const totalClassCount = await Class.count();
    const totalActiveClassCount = await Class.count({
      where: { isActive: true },
    });
    const totalCourses = await Course.count({
      where: { createdBy: user.id },
    });

    const totalClasses = await Class.count({ where: { createdBy: user.id } });

    const totalActiveClasses = await Class.count({
      where: { isActive: true, createdBy: user.id },
    });

    if (roles.includes("Admin")) {
      const totalUserCount = await User.count();
      const totalActiveUserCount = await User.count({
        where: { isActive: true },
      });
      return formatApiResponse(
        {
          totalUserCount,
          totalActiveUserCount,
          totalCourseCount,
          totalClassCount,
          totalActiveClassCount,
        },
        1,
        "Dashboard data fetched successfully",
        res.status(200)
      );
    }

    if (roles.includes("Tutor")) {
      return formatApiResponse(
        {
          totalCourses,
          totalClasses,
          totalActiveClasses,
        },
        1,
        "Dashboard data fetched successfully",
        res.status(200)
      );
    }

    // Default response if roles do not match any condition
    return res.status(403).json({ message: "Unauthorized" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error", error });
  }
};

export default dashboardApi;
