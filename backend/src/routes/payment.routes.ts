import express from "express";
import {
  createDemoPayment,
  getPaymentStatus,
  processRefund,
} from "../controllers/payment.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/create-demo", authenticateToken, createDemoPayment);
router.get("/:paymentId/status", authenticateToken, getPaymentStatus);
router.post(
  "/:paymentId/refund",
  authenticateToken,
  requireRole(["ADMIN"]),
  processRefund
);

export default router;
