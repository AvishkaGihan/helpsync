import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS, ERROR_CODES } from "../utils/constants";
import { validateEmail, validatePassword } from "../utils/validation";

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, role = "CUSTOMER" } = req.body;

    if (!validateEmail(email)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "Invalid email format",
        },
      });
    }

    if (!validatePassword(password)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "Password must be at least 8 characters",
        },
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        error: {
          code: ERROR_CODES.CONFLICT,
          message: "Email already exists",
        },
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    res.status(HTTP_STATUS.CREATED).json({ user });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Registration failed",
      },
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: "Invalid email or password",
        },
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        error: {
          code: ERROR_CODES.UNAUTHORIZED,
          message: "Invalid email or password",
        },
      });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Login failed",
      },
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: "User not found",
        },
      });
    }

    res.json(user);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch profile",
      },
    });
  }
};
