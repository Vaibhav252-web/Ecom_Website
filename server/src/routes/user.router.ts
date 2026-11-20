import express from "express";
import { userController } from "../controllers/user.controller";
import { validate } from "../middleware/validate.middleware";
import userSchema from "../schema/user.schema";
import { AuthMiddleware } from "../middleware/auth.middleware";

const userRouter = express.Router();

userRouter.post(
  "/register",
  validate(userSchema.registerValidation),
  userController.register,
);

userRouter.post(
  "/verifyOTP",
  validate(userSchema.VerifyOTPValidaton),
  userController.verifyOTP,
);

userRouter.post(
  "/login",
  validate(userSchema.LoginValidation),
  userController.login,
);

userRouter.post(
  "/getUser",
  validate(userSchema.GetUserValidation),
  AuthMiddleware(["user", "seller"]), 
  userController.getUser
);

userRouter.get(
  "/getAllUser",
  // validate(userSchema.GetUserValidation),
  AuthMiddleware(["user"]),
  userController.getAllUser,
);

export default userRouter;
