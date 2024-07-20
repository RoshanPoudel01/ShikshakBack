import express from "express";
import { testController } from "../controller";
import { registerUserController } from "../controller/UserController";

const router = express.Router();

// router.post("/", upload.single('name'),(req, res) => {
//   res.send("Hello World!");
// });
router.get("/test", testController);
router.post("/registerUser", registerUserController);

export default router;
