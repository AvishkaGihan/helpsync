import express from 'express';
import {
  createDemoPayment,
  getPaymentStatus,
  processRefund,
} from '../controllers/payment.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/payments/create-demo:
 *   post:
 *     summary: Create a demo payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Payment created
 *       401:
 *         description: Unauthorized
 */
router.post('/create-demo', authenticateToken, createDemoPayment);

/**
 * @swagger
 * /api/payments/{paymentId}/status:
 *   get:
 *     summary: Get payment status
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:paymentId/status', authenticateToken, getPaymentStatus);

/**
 * @swagger
 * /api/payments/{paymentId}/refund:
 *   post:
 *     summary: Process refund (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Refund processed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.post(
  '/:paymentId/refund',
  authenticateToken,
  requireRole(['ADMIN']),
  processRefund
);

export default router;
