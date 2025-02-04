import { Router } from "express";
import {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changeCurrentPassword,
  updateAccountDetails,
  getCurrentUser,
} from "../controllers/users.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter.get("/", (req, res) => {
  res.send("<h1>Welcome to the User API wala Route</h1>");
});

userRouter.route("/register").post(registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").post(verifyJWT, logOutUser);
userRouter.route("/refreshAccessToken").post(refreshAccessToken);
userRouter.route("/changePassword").post(verifyJWT, changeCurrentPassword);
userRouter.route("/updateAccountDetails").put(verifyJWT, updateAccountDetails);
userRouter.route("/currentUser").get(verifyJWT, getCurrentUser);

export default userRouter;
