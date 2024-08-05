import express from "express";
import { testController } from "../controller";
import {
  createClassController,
  deleteClassController,
  getAllClassesController,
  getClassByIdController,
  getClassesByUser,
  toggleClassStatusController,
} from "../controller/ClassController";
import {
  createCourseController,
  deletCourseController,
  editCourseController,
  getCourseByIdController,
  getCoursesController,
} from "../controller/CourseController";
import {
  createSubCourseController,
  deleteSubCourseController,
  editSubCourseController,
  getAllSubCoursesController,
  getSubCourseByIdController,
  getSubCoursesController,
} from "../controller/SubCourseController";
import {
  changeUserStatus,
  getALlUsers,
  initAdminData,
  loginUserController,
  registerUserController,
} from "../controller/UserController";
import { checkAuth, checkDuplicateEmail } from "../middleware/verifyUser";
import { upload } from "../utils/multer";

const router = express.Router();

// router.post("/", upload.single('name'),(req, res) => {
//   res.send("Hello World!");
// });
router.get("/test", testController);
router.post("/registerUser", checkDuplicateEmail, registerUserController);
router.post("/userLogin", loginUserController);
router.get("/initAdmin", checkAuth, initAdminData);
router.get("/allUsers", checkAuth, getALlUsers);
router.get("/toggleUserStatus/id=:id", checkAuth, changeUserStatus);
//course
router.post(
  "/createCourse",
  checkAuth,
  upload.single("imageUrl"),
  createCourseController
);
router.get("/getCourses", checkAuth, getCoursesController);
router.get("/getCourse/id=:id", getCourseByIdController);
router.delete("/deleteCourse/id=:id", checkAuth, deletCourseController);
router.post(
  "/editCourse/id=:id",
  upload.single("imageUrl"),
  checkAuth,
  editCourseController
);

//subcourse
router.get("/getAllSubCourses", getAllSubCoursesController);
router.post(
  "/createSubCourse",
  upload.single("imageUrl"),
  checkAuth,
  createSubCourseController
);
router.get("/getSubCourses", checkAuth, getSubCoursesController);
router.get("/getSubCourses/id=:id", checkAuth, getSubCourseByIdController);
router.post(
  "/editSubCourse/id=:id",
  upload.single("imageUrl"),
  checkAuth,
  editSubCourseController
);
router.delete("/deleteSubCourse/id=:id", checkAuth, deleteSubCourseController);

//class Routes
router.post("/createClass", checkAuth, createClassController);
router.get("/getClasses", checkAuth, getAllClassesController);
router.get("/getMyClasses", checkAuth, getClassesByUser);
router.get("/getClass/id=:id", checkAuth, getClassByIdController);
router.get("/toggleClassStatus/id=:id", checkAuth, toggleClassStatusController);
router.delete("/deleteClass/id=:id", checkAuth, deleteClassController);
export default router;
