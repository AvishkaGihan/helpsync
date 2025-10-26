import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import { HTTP_STATUS, ERROR_CODES } from "../utils/constants";

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      error: {
        code: ERROR_CODES.VALIDATION_ERROR,
        message: "Validation failed",
        details: errors.array(),
      },
    });
  }

  next();
};
