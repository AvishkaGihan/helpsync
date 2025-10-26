import express from 'express';
import { getSummary } from '../controllers/analytics.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/analytics/summary:
 *   get:
 *     summary: Get analytics summary (Admin only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Analytics summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalConversations:
 *                   type: integer
 *                 activeUsers:
 *                   type: integer
 *                 totalRevenue:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get('/summary', authenticateToken, requireRole(['ADMIN']), getSummary);

export default router;
