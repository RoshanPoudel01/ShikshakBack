import express from "express";
import { roleController } from "../controller";
import {
  classJoinedByUser,
  createClassController,
  deleteClassController,
  getAllClassesController,
  getClassByIdController,
  getClassesByUser,
  joinClassController,
  toggleClassStatusController,
  updateClassController,
} from "../controller/ClassController";
import {
  createCourseController,
  deletCourseController,
  editCourseController,
  getCourseByIdController,
  getCourseByUserController,
  getCoursesController,
} from "../controller/CourseController";
// import {
//   createSubCourseController,
//   deleteSubCourseController,
//   editSubCourseController,
//   getAllSubCoursesController,
//   getSubCourseByIdController,
//   getSubCoursesController,
// } from "../controller/SubCourseController";
import {
  changeUserStatus,
  getALlUsers,
  getUserByIdController,
  initAdminData,
  loginUserController,
  registerUserController,
  saveUserProfile,
} from "../controller/UserController";
import { checkAuth, checkDuplicateEmail } from "../middleware/verifyUser";
import { upload } from "../utils/multer";

const router = express.Router();

// router.post("/", upload.single('name'),(req, res) => {
//   res.send("Hello World!");
// });
router.post("/role", roleController);
router.post("/registerUser", checkDuplicateEmail, registerUserController);
router.post("/userLogin", loginUserController);
router.get("/initAdmin", checkAuth, initAdminData);
router.get("/allUsers", checkAuth, getALlUsers);
router.get("/toggleUserStatus/id=:id", checkAuth, changeUserStatus);
router.get("/getUserById/id=:id", checkAuth, getUserByIdController);

//course
router.post(
  "/createCourse",
  checkAuth,
  upload.single("imageUrl"),
  createCourseController
);
router.get("/getCourses", getCoursesController);
router.get("/getCourse/id=:id", getCourseByIdController);
router.delete("/deleteCourse/id=:id", checkAuth, deletCourseController);
router.post(
  "/editCourse/id=:id",
  upload.single("imageUrl"),
  checkAuth,
  editCourseController
);
router.get("/getMyCourses", checkAuth, getCourseByUserController);

//subcourse
// router.get("/getAllSubCourses", getAllSubCoursesController);
// router.post(
//   "/createSubCourse",
//   upload.single("imageUrl"),
//   checkAuth,
//   createSubCourseController
// );
// router.get("/getSubCourses", checkAuth, getSubCoursesController);
// router.get("/getSubCourses/id=:id", checkAuth, getSubCourseByIdController);
// router.post(
//   "/editSubCourse/id=:id",
//   upload.single("imageUrl"),
//   checkAuth,
//   editSubCourseController
// );
// router.delete("/deleteSubCourse/id=:id", checkAuth, deleteSubCourseController);

//class Routes
router.post("/createClass", checkAuth, createClassController);
router.get("/getClasses", checkAuth, getAllClassesController);
router.get("/getMyClasses", checkAuth, getClassesByUser);
router.get("/getClass/id=:id", checkAuth, getClassByIdController);
router.get("/toggleClassStatus/id=:id", checkAuth, toggleClassStatusController);
router.delete("/deleteClass/id=:id", checkAuth, deleteClassController);
router.post("/editClass/id=:id", checkAuth, updateClassController);
router.get("/joinClass/id=:id", checkAuth, joinClassController);
router.get("/getMyClass", checkAuth, classJoinedByUser);

// UserProfile Routes
router.post(
  "/createUserProfile",
  checkAuth,
  upload.fields([
    { name: "document", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  saveUserProfile
);

export default router;
