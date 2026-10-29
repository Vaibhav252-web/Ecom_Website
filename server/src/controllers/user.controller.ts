import { Request, Response, NextFunction } from "express";
import { TryCatch, Success } from "../utils/helper";
import {
  GetUserRequest,
  LoginRequest,
  RegisterRequest,
  VerifyRequest,
} from "../type/API/user";
import ErrorHandler from "../utils/ErrorHandler";
import User from "../model/user.model";
import { generateOtp, sendOtp, otpValidFor } from "../utils/helper";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const register = TryCatch(
  async (
    req: Request<{}, {}, RegisterRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    const { username, email, password, phone, address, countryCode, dob, role } =
      req.body;

    if (
      !username ||
      !email ||
      !password ||
      !phone ||
      !address ||
      !countryCode ||
      !dob ||
      !role
    ) {
      return next(new ErrorHandler("Enter the fields", 400));
    }

    const newUser = new User({
      username,
      email,
      password,
      phone,
      address,
      countryCode,
      dob,
      role: role,
    });

    // Send OTP
    const OTP = generateOtp();
    const hashOTP = await bcrypt.hash(OTP, 10);

    const subject = "OTP for email varification";
    const text = `Hi ${newUser.username},\n\nTo verify your email address, please use the following OTP: ${OTP}\n\nIf you did not request this verification, please ignore this email.`;
    const html = `<div style="margin: 30px; padding: 30px; border: 1px solid black; border-radius: 20px 10px;">
         <h4><strong>Hi ${newUser.username},</strong></h4>
         <p>To verify your email address, please use the following OTP: <strong>${OTP}</strong></p>
         <p>If you did not request this verification, please ignore this email.</p>
         <p>Thanks,</p>
     </div>`;

    await sendOtp(newUser.email, subject, text, html);

    newUser.otp = hashOTP;
    newUser.otpExpiry = otpValidFor(10);
    await newUser.save();

    if (!newUser) {
      return next(new ErrorHandler("User is not crated!", 400));
    }

    return Success(res, 200, "User is created sucessfully", { userId: newUser._id });
  },
);

const verifyOTP = TryCatch(
  async (
    req: Request<{}, {}, VerifyRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    const { userId, otp } = req.body;

    if (!userId || !otp) {
      return next(new ErrorHandler("Enter the fields", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    if (user?.otpExpiry && user.otpExpiry.getTime() < Date.now()) {
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      return next(new ErrorHandler("OTP expires", 401));
    }

    const isMatched = await user.isMatchedOtp(otp);
    if (!isMatched) {
      return next(new ErrorHandler("OTP is incorrect", 400));
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new ErrorHandler("Jwt secret key is not found", 404));
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      secret as string,
      {
        expiresIn: "3h",
      },
    );

    return Success(res, 200, "User verified sucessfully", { token });
  },
);

const login = TryCatch(
  async (
    req: Request<{}, {}, LoginRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Enter the fields", 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    const isMatchedPassword = await user.comparePassword(password);
    if (!isMatchedPassword) {
      return next(new ErrorHandler("Password is not correct", 400));
    }

    if (!user.isVerified) {
      // verify first generate the OTP
      const OTP = generateOtp();
      const hashOTP = await bcrypt.hash(OTP, 10);

      const subject = "OTP for email varification";
      const text = `Hi ${user.username},\n\nTo verify your email address, please use the following OTP: ${OTP}\n\nIf you did not request this verification, please ignore this email.`;
      const html = `<div style="margin: 30px; padding: 30px; border: 1px solid black; border-radius: 20px 10px;">
         <h4><strong>Hi ${user.username},</strong></h4>
         <p>To verify your email address, please use the following OTP: <strong>${OTP}</strong></p>
         <p>If you did not request this verification, please ignore this email.</p>
         <p>Thanks,</p>
     </div>`;

      await sendOtp(user.email, subject, text, html);

      user.otp = hashOTP;
      user.otpExpiry = otpValidFor(10);
      await user.save();

      return Success(
        res,
        200,
        "You are not verified!, verify first. The OTP sent to your email succesfully",
        {
          userId: user._id.toString(),
        },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next(new ErrorHandler("Jwt secret key is not found", 404));
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      secret as string,
      {
        expiresIn: "3h",
      },
    );

    Success(res, 200, "User login sucessfully", { token });
  },
);

const getUser = TryCatch(
  async (
    req: Request<{}, {}, GetUserRequest>,
    res: Response,
    next: NextFunction,
  ) => {
    const { userId } = req.body;

    if (!userId) {
      return next(new ErrorHandler("Enter the userId", 400));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

    Success(res, 200, "Here is your detail", { user });
  },
);

const getAllUser = TryCatch(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.find({});
    if (!user) {
      return next(new ErrorHandler("No user found", 404));
    }

    Success(res, 200, "Here is your detail", { user });
  },
);

export const userController = {
  register,
  verifyOTP,
  login,
  getUser,
  getAllUser,
};
