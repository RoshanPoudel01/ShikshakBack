import { Request, Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Course from "../model/Course";

const createCourseController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (user.isAdmin) {
      const { title } = req.body;
      const image = req.file && req.file.path; // Check if image exists in the request

      const courseData = await Course.create({
        title,
        imageUrl: image,
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
    const courses = await Course.findAll();
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

//edit course
const editCourseController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (user.isAdmin) {
      const { id } = req.params;
      const image = req.file && req.file.originalname; // Check if image exists in the request

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
  getCoursesController,
};