import express from "express";
import {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  getMessages,
  getEscalatedConversations,
} from "../controllers/conversation.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/", authenticateToken, createConversation);
router.get("/", authenticateToken, getConversations);
router.get(
  "/escalated",
  authenticateToken,
  requireRole(["ADMIN"]),
  getEscalatedConversations
);
router.get("/:id", authenticateToken, getConversation);
router.patch("/:id", authenticateToken, updateConversation);
router.get("/:id/messages", authenticateToken, getMessages);

export default router;
