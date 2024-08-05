import { Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Class from "../model/Class";
import SubCourse from "../model/SubCourse";

// Create Class
const createClassController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;

    //check if user is tutor
    if (user.isUser || user.isAdmin) {
      formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
      return;
    }
    const { title, description, subCourseId, startTime, endTime } = req.body;
    // validate inputs
    if (!title) {
      formatApiResponse(null, 0, "Title is required", res?.status(400));
      return;
    }
    if (!subCourseId) {
      formatApiResponse(null, 0, "Course is required", res?.status(400));
      return;
    }
    if (!startTime) {
      formatApiResponse(null, 0, "Start time is required", res?.status(400));
      return;
    }
    //check if subcourse exists
    const subCourse = await SubCourse.findByPk(subCourseId);

    if (!subCourse) {
      formatApiResponse(null, 0, "Course not found", res?.status(404));
      return;
    }

    const newClass = {
      title,
      description,
      subCourseId,
      startTime,
      endTime,
      createdBy: user.id,
    };
    // create class
    const classData = await Class.create(newClass);
    formatApiResponse(
      classData,
      1,
      "Class Created Successfully",
      res?.status(201)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

// Get all classes
const getAllClassesController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const classes = await Class.findAll({
      order: [["title", "ASC"]],
    });
    formatApiResponse(
      classes,
      1,
      "Classes Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

// Get classes by user who created them
const getClassesByUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const classes = await Class.findAll({
      where: {
        createdBy: user.id,
      },
      order: [["title", "ASC"]],
    });
    formatApiResponse(
      classes,
      1,
      "Classes Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

// Get class by id
const getClassByIdController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const classData = await Class.findByPk(id);
    formatApiResponse(
      classData,
      1,
      "Class Fetched Successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

// Update class
const updateClassController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  const user = req.user;
  if (user.isUser || user.isAdmin) {
    formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
    return;
  }
  try {
    const { id } = req.params;
    const classData: any = await Class.findByPk(id);
    if (!classData) {
      formatApiResponse(null, 0, "Class not found", res?.status(404));
      return;
    }
    if (classData?.createdBy !== user.id) {
      formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
      return;
    }
    const { title, description, subCourseId, startTime, endTime } = req.body;
    // validate inputs
    if (!title) {
      formatApiResponse(null, 0, "Title is required", res?.status(400));
      return;
    }
    if (!subCourseId) {
      formatApiResponse(null, 0, "Course is required", res?.status(400));
      return;
    }
    if (!startTime) {
      formatApiResponse(null, 0, "Start time is required", res?.status(400));
      return;
    }
    //check if subcourse exists
    const subCourse = await SubCourse.findByPk(subCourseId);

    if (!subCourse) {
      formatApiResponse(null, 0, "Course not found", res?.status(404));
      return;
    }
    await classData.update({
      title,
      description,
      subCourseId,
      startTime,
      endTime,
    });
    formatApiResponse(
      classData,
      1,
      "Class updated successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

// Toggle class status
const toggleClassStatusController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    if (user.isUser || user.isAdmin) {
      formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
      return;
    }
    const { id } = req.params;
    const classData: any = await Class.findByPk(id);
    console.log(classData?.createdBy, user.id);
    if (classData?.createdBy !== user.id) {
      formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
      return;
    }
    if (!classData) {
      formatApiResponse(null, 0, "Class not found", res?.status(404));
      return;
    }

    if (classData?.isActive) {
      classData.isActive = false;
    } else {
      classData.isActive = true;
    }
    await classData.save();
    formatApiResponse(
      classData,
      1,
      "Class status updated successfully",
      res?.status(200)
    );
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

// Delete class
const deleteClassController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    console.log("first");
    const user = req.user;
    if (user.isUser || user.isAdmin) {
      formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
      return;
    }
    const { id } = req.params;
    const classData: any = await Class.findByPk(id);
    if (!classData) {
      formatApiResponse(null, 0, "Class not found", res?.status(404));
      return;
    }
    if (classData?.createdBy !== user.id) {
      formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
      return;
    }
    await classData.destroy();
    formatApiResponse(null, 1, "Class deleted successfully", res?.status(200));
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

export {
  createClassController,
  deleteClassController,
  getAllClassesController,
  getClassByIdController,
  getClassesByUser,
  toggleClassStatusController,
  updateClassController,
};
