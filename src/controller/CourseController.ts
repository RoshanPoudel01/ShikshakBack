import { Request, Response } from "express";
import { Sequelize } from "sequelize";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Course from "../model/Course";
import SubCourse from "../model/SubCourse";
import User from "../model/User";

const createCourseController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user.isAdmin && !user.isUser) {
      const { title, description, tags } = req.body;
      const image = req.file && req.file.path; // Check if image exists in the request

      const courseData = await Course.create({
        title,
        description,
        imageUrl: image,
        createdBy: user.id,
        tags,
      });
      formatApiResponse(
        courseData,
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

//get all courses
const getCoursesController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const courses = await Course.findAll({
      order: [["title", "ASC"]],
      include: [
        {
          model: User,
          attributes: [
            [
              Sequelize.fn(
                "CONCAT",
                Sequelize.col("first_name"),
                " ",
                Sequelize.col("middle_name"),
                " ",
                Sequelize.col("last_name")
              ),
              "full_name",
            ],
          ], // Include necessary user fields
          // attributes: ["id", "first_name", "last_name", "middle_name", "email"], // Include necessary user fields
        },
      ],
    });
    formatApiResponse(
      courses,
      1,
      "Courses Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

//get course by id
const getCourseByIdController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    formatApiResponse(
      course,
      1,
      "Course Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

//get course by user
const getCourseByUserController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const courses = await Course.findAll({
      where: {
        createdBy: user.id,
      },
      order: [["title", "ASC"]],
      include: [
        {
          model: User,
          attributes: [
            [
              Sequelize.fn(
                "CONCAT",
                Sequelize.col("first_name"),
                " ",
                Sequelize.col("middle_name"),
                " ",
                Sequelize.col("last_name")
              ),
              "full_name",
            ],
          ], // Include necessary user fields
          // attributes: ["id", "first_name", "last_name", "middle_name", "email"], // Include necessary user fields
        },
      ],
    });
    formatApiResponse(
      courses,
      1,
      "Courses Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

//edit course
const editCourseController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (!user.isAdmin && !user.isUser) {
      const { id } = req.params;
      const image = req.file && req.file.path; // Check if image exists in the request

      const course: any = await Course.findByPk(id);
      const editCourse = await course.update({
        ...req.body,
        imageUrl: image ? image : course.imageUrl,
      });
      formatApiResponse(
        editCourse,
        1,
        "Course Updated Successfully",
        res?.status(200)
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

//delete course
const deletCourseController = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);
    if (!course) {
      formatApiResponse(null, 0, "Course not found", res?.status(404));
      return;
    }
    const subCourse = await SubCourse.findOne({
      where: {
        courseId: id,
      },
    });
    if (subCourse) {
      formatApiResponse(
        null,
        0,
        "Cannot delete course with subcourses",
        res?.status(400)
      );
      return;
    }
    await course.destroy();
    formatApiResponse(null, 1, "Course Deleted Successfully", res?.status(200));
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};
export {
  createCourseController,
  deletCourseController,
  editCourseController,
  getCourseByIdController,
  getCourseByUserController,
  getCoursesController,
};
