import express from "express";
import {
  getArticles,
  getArticle,
  searchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from "../controllers/knowledge-base.controller";
import { authenticateToken, requireRole } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", getArticles);
router.get("/search", searchArticles);
router.get("/:id", getArticle);
router.post("/", authenticateToken, requireRole(["ADMIN"]), createArticle);
router.put("/:id", authenticateToken, requireRole(["ADMIN"]), updateArticle);
router.delete("/:id", authenticateToken, requireRole(["ADMIN"]), deleteArticle);

export default router;
