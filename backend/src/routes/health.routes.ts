import express from 'express';
import { healthCheck, databaseHealth } from '../controllers/health.controller';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
router.get('/', healthCheck);

/**
 * @swagger
 * /api/health/db:
 *   get:
 *     summary: Database health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database is healthy
 *       500:
 *         description: Database error
 */
router.get('/db', databaseHealth);

export default router;
