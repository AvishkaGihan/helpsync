import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";
import { HTTP_STATUS, ERROR_CODES } from "../utils/constants";

interface ApiError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  logger.error("API Error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userId: req.user?.userId,
  });

  const statusCode = err.statusCode || HTTP_STATUS.INTERNAL_ERROR;
  const errorCode = err.code || ERROR_CODES.INTERNAL_ERROR;

  res.status(statusCode).json({
    error: {
      code: errorCode,
      message: err.message || "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    },
  });
};
