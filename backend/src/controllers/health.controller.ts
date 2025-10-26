import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const healthCheck = (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
};

export const databaseHealth = async (req: Request, res: Response) => {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const latency = Date.now() - start;

    res.json({
      status: "ok",
      database: "connected",
      latency: `${latency}ms`,
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
    });
  }
};
