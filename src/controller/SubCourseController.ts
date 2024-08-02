import { Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Course from "../model/Course";
import SubCourse from "../model/SubCourse";
import User from "../model/User";

const createSubCourseController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user.isAdmin && !user.isUser) {
      const { title, description, courseId } = req.body;
      const image = req.file && req.file.path; // Check if image exists in the request

      const course = await Course.findByPk(courseId);
      if (!course) {
        formatApiResponse(null, 0, "Course not found", res?.status(404));
        return;
      }
      await SubCourse.create({
        title,
        description,
        courseId,
        createdBy: user.id,
        imageUrl: image,
      });

      formatApiResponse(
        null,
        1,
        "Course Created Successfully",
        res?.status(201)
      );
    } else {
      formatApiResponse(
        null,
        0,
        "Your are not Authorized for this task",
        res?.status(401)
      );
    }
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

//get sub courses by user who created them
const getSubCoursesController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const subCourses = await SubCourse.findAll({
      where: {
        createdBy: user.id,
      },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
    });
    formatApiResponse(
      subCourses,
      1,
      "SubCourses Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

//get all sub courses
const getAllSubCoursesController = async (req: Request, res: Response) => {
  try {
    const subCourses = await SubCourse.findAll({
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
        {
          model: User,
          attributes: ["id", "first_name", "last_name"],
        },
      ],
    });
    formatApiResponse(
      subCourses,
      1,
      "SubCourses Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

// edit sub course
const editSubCourseController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user.isAdmin && !user.isUser) {
      const { courseId } = req.body;
      const image = req.file && req.file.path; // Check if image exists in the request
      const { id } = req.params;
      const subcourse: any = await SubCourse.findByPk(id);
      const course = await Course.findByPk(courseId);
      if (!course) {
        formatApiResponse(null, 0, "Course not found", res?.status(404));
        return;
      }
      await subcourse.update({
        ...req.body,
        imageUrl: image ? image : subcourse.imageUrl,
      });

      formatApiResponse(
        null,
        1,
        "Course Updated Successfully",
        res?.status(201)
      );
    } else {
      formatApiResponse(
        null,
        0,
        "Your are not Authorized for this task",
        res?.status(401)
      );
    }
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

//getSubCourseByIdController
const getSubCourseByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const subCourse = await SubCourse.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
    });
    formatApiResponse(
      subCourse,
      1,
      "SubCourse Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

//delete sub course
const deleteSubCourseController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user.isAdmin && !user.isUser) {
      const { id } = req.params;
      const subcourse: any = await SubCourse.findByPk(id);
      await subcourse.destroy();

      formatApiResponse(
        null,
        1,
        "Course Deleted Successfully",
        res?.status(201)
      );
    } else {
      formatApiResponse(
        null,
        0,
        "Your are not Authorized for this task",
        res?.status(401)
      );
    }
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};
export {
  createSubCourseController,
  deleteSubCourseController,
  editSubCourseController,
  getAllSubCoursesController,
  getSubCourseByIdController,
  getSubCoursesController,
};
