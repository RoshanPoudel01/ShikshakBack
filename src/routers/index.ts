import express from "express";
import { testController } from "../controller";
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
  getSubCourseByIdController,
  getSubCoursesController,
} from "../controller/SubCourseController";
import {
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
  editCourseController
);

//subcourse
router.post(
  "/createSubCourse",
  upload.single("imageUrl"),
  checkAuth,
  createSubCourseController
);
router.get("/getSubCourses", getSubCoursesController);
router.get("/getSubCourses/id=:id", getSubCourseByIdController);
router.post(
  "/editSubCourse/id=:id",
  upload.single("imageUrl"),
  checkAuth,
  editSubCourseController
);
router.delete("/deleteSubCourse/id=:id", checkAuth, deleteSubCourseController);
export default router;
