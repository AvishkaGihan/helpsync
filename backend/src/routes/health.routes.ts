import express from "express";
import { healthCheck, databaseHealth } from "../controllers/health.controller";

const router = express.Router();

router.get("/", healthCheck);
router.get("/db", databaseHealth);

export default router;
