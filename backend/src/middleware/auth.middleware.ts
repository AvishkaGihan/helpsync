import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/jwt.types";
import { HTTP_STATUS, ERROR_CODES } from "../utils/constants";

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: "No token provided",
      },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.UNAUTHORIZED).json({
      error: {
        code: ERROR_CODES.UNAUTHORIZED,
        message: "Invalid token",
      },
    });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: "Authentication required",
        },
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: "Insufficient permissions",
        },
      });
    }

    next();
  };
};
