import express from "express";
import { getSummary } from "../controllers/analytics.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/summary", authenticateToken, requireRole(["ADMIN"]), getSummary);

export default router;
