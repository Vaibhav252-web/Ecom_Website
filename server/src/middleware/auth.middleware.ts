import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../type/DB/user";
import User from "../model/user.model";
import ErrorHandler from "../utils/ErrorHandler";
import { TryCatch } from "../utils/helper";

export interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: IUser;
  role?: string;
}

interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export const AuthMiddleware = (allowedRoles: string[] = []) =>
  TryCatch(
    async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      const authorHead = req.headers.authorization;

      if (!authorHead) {
        return next(new ErrorHandler("Please login to access", 401));
      }

      const parts = authorHead.split(" ");

      if (parts.length !== 2 || parts[0] !== "Bearer") {
        return next(new ErrorHandler("Invalid authorization format", 400));
      }

      const token = parts[1];

      const decode = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as JwtPayload;

      const user = await User.findById(decode.id);

      if (!user || user.isDeleted) {
        return next(new ErrorHandler("User no longer exist", 401));
      }

      if (!user.isVerified) {
        return next(new ErrorHandler("Account is not verified", 403));
      }

      if (
        allowedRoles.length > 0 &&
        (!user.role || !allowedRoles.includes(user.role))
      ) {
        return next(
          new ErrorHandler(
            "You are not authorized to access this resource",
            403,
          ),
        );
      }

      req.userId = user._id.toString();
      req.user = user;
      req.role = user.role;

      next();
    },
  );
