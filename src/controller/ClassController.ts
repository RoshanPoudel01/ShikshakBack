import { Response } from "express";
import { formatApiResponse } from "../middleware/responseFormatter";
import { AuthenticatedRequest } from "../middleware/verifyUser";
import Class from "../model/Class";
import Course from "../model/Course";
import User from "../model/User";
import UserProfile from "../model/UserProfile";
const { Op } = require("sequelize");
// Create Class
const createClassController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const roles = req.roles;
    // check if user is tutor
    if (!roles?.includes("Tutor")) {
      formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
      return;
    }
    const {
      title,
      description,
      courseId,
      startTime,
      endTime,
      startDate,
      endDate,
      price,
      classLink,
    } = req.body;
    // validate inputs
    if (!title) {
      formatApiResponse(null, 0, "Title is required", res?.status(400));
      return;
    }
    if (!courseId) {
      formatApiResponse(null, 0, "Course is required", res?.status(400));
      return;
    }
    if (!startTime) {
      formatApiResponse(null, 0, "Start time is required", res?.status(400));
      return;
    }
    //check if subcourse exists
    const course = await Course.findByPk(courseId);

    if (!course) {
      formatApiResponse(null, 0, "Course not found", res?.status(404));
      return;
    }

    // Check for class collisions
    const classExists = await Class.findOne({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              {
                startDate: {
                  [Op.between]: [startDate, endDate],
                },
              },
              {
                endDate: {
                  [Op.between]: [startDate, endDate],
                },
              },
            ],
          },
          {
            [Op.or]: [
              {
                startTime: {
                  [Op.between]: [startTime, endTime],
                },
              },
              {
                endTime: {
                  [Op.between]: [startTime, endTime],
                },
              },
            ],
          },
        ],
        createdBy: user.id,
      },
    });

    if (classExists) {
      formatApiResponse(
        null,
        0,
        "You already have a class scheduled that overlaps with this time slot",
        res?.status(400)
      );
      return;
    }

    // Check for maximum classes per day
    const classesOnDay = await Class.count({
      where: {
        startDate: startDate,
        createdBy: user.id,
      },
    });

    if (classesOnDay >= 4) {
      formatApiResponse(
        null,
        0,
        "You have already created the maximum number of classes (4) for this day",
        res?.status(400)
      );
      return;
    }

    const newClass = {
      title,
      description,
      courseId,
      startTime,
      endTime,
      createdBy: user.id,
      startDate,
      endDate,
      price,
      classLink,
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
    const roles = req.roles;

    const isStudent = roles?.includes("Student");
    const classes = await Class.findAll({
      order: [["title", "ASC"]],
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title", "imageUrl"],
        },
        {
          model: User,
          attributes: ["id", "first_name", "middle_name", "last_name"],
          include: [
            {
              model: UserProfile,
              as: "userprofile",
              attributes: ["profilePicture", "phoneNumber"], // Adjust attributes as needed
            },
          ],
        },
      ],
    });
    const classDataForStudents = classes.map((classData: any) => {
      const formattedClass = {
        id: classData.id,
        title: classData.title,
        description: classData.description,
        startTime: classData.startTime,
        endTime: classData.endTime,
        course: classData.course,
        tutor: classData.user,
        price: classData.price,
        startDate: classData.startDate,
        endDate: classData.endDate,
      };
      return formattedClass;
    });
    formatApiResponse(
      isStudent ? classDataForStudents : classes,
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
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      order: [["startTime", "ASC"]],
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
    const classData = await Class.findByPk(id, {
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
    });
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
    const {
      title,
      description,
      courseId,
      startTime,
      endTime,
      startDate,
      endDate,
      price,
      classLink,
    } = req.body;
    // validate inputs
    if (!title) {
      formatApiResponse(null, 0, "Title is required", res?.status(400));
      return;
    }
    if (!courseId) {
      formatApiResponse(null, 0, "Course is required", res?.status(400));
      return;
    }
    if (!startTime) {
      formatApiResponse(null, 0, "Start time is required", res?.status(400));
      return;
    }
    //check if course exists
    const course = await Course.findByPk(courseId);

    if (!course) {
      formatApiResponse(null, 0, "Course not found", res?.status(404));
      return;
    }
    const existingClass = await Class.findOne({
      where: { id, createdBy: user.id },
    });

    if (!existingClass) {
      formatApiResponse(
        null,
        0,
        "Class not found or you don't have permission to edit it",
        res?.status(404)
      );
      return;
    }

    // Check for class collisions
    const classExists = await Class.findOne({
      where: {
        [Op.and]: [
          { id: { [Op.ne]: id } }, // Exclude the current class being edited
          { createdBy: user.id },
          {
            [Op.or]: [
              {
                startDate: { [Op.lte]: endDate },
                endDate: { [Op.gte]: startDate },
              },
            ],
          },
          {
            [Op.or]: [
              {
                startTime: { [Op.lt]: endTime },
                endTime: { [Op.gt]: startTime },
              },
            ],
          },
        ],
      },
    });

    if (classExists) {
      formatApiResponse(
        null,
        0,
        "The updated schedule overlaps with another class",
        res?.status(400)
      );
      return;
    }
    await classData.update({
      title,
      description,
      courseId,
      startTime,
      endTime,
      startDate,
      endDate,
      price,
      classLink,
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

const joinClassController = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const user = req.user;
    const roles = req.roles;
    const isStudent = roles?.includes("Student");
    const { id } = req.params;
    const classData: any = await Class.findByPk(id);
    if (!isStudent) {
      formatApiResponse(null, 0, "UnAuthorized", res?.status(401));
      return;
    }
    if (!classData) {
      formatApiResponse(null, 0, "Class not found", res?.status(404));
      return;
    }

    const enrolledUser = await Class.findOne({
      where: {
        joinedUser: user.id,
        id: id,
      },
    });
    if (enrolledUser) {
      formatApiResponse(
        null,
        0,
        "You have already joined this class",
        res?.status(400)
      );
      return;
    }
    await classData.update({
      joinedUser: user.id,
    });
    formatApiResponse(
      null,
      1,
      "You have joined the class successfully",
      res?.status(200)
    );
    // const data = await classData.toJSON();

    // const formData = {
    //   return_url: "http://localhost:3300/api/payment/khalti/verify",
    //   website_url: "http://localhost:3300",
    //   amount: data.price,
    //   purchase_order_id: id,
    //   purchase_order_name: "test",
    // };

    // console.log({ formData });

    // await initiateKhalti(formData, req, res);
  } catch (error) {
    formatApiResponse(null, 0, error?.message, res?.status(400));
  }
};

const classJoinedByUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = req.user;
    const classes = await Class.findAll({
      where: {
        joinedUser: user.id,
      },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["id", "title"],
        },
      ],
      order: [["startTime", "ASC"]],
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
export {
  classJoinedByUser,
  createClassController,
  deleteClassController,
  getAllClassesController,
  getClassByIdController,
  getClassesByUser,
  joinClassController,
  toggleClassStatusController,
  updateClassController,
};
