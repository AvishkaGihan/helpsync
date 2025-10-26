import express from 'express';
import {
  createConversation,
  getConversations,
  getConversation,
  updateConversation,
  getMessages,
  getEscalatedConversations,
} from '../controllers/conversation.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/conversations:
 *   post:
 *     summary: Create a new conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Conversation created
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateToken, createConversation);

/**
 * @swagger
 * /api/conversations:
 *   get:
 *     summary: Get user's conversations
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of conversations
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   title:
 *                     type: string
 *                   status:
 *                     type: string
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateToken, getConversations);

/**
 * @swagger
 * /api/conversations/escalated:
 *   get:
 *     summary: Get escalated conversations (Admin only)
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of escalated conversations
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.get(
  '/escalated',
  authenticateToken,
  requireRole(['ADMIN']),
  getEscalatedConversations
);

/**
 * @swagger
 * /api/conversations/{id}:
 *   get:
 *     summary: Get a specific conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:id', authenticateToken, getConversation);

/**
 * @swagger
 * /api/conversations/{id}:
 *   patch:
 *     summary: Update a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *               escalated:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Conversation updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.patch('/:id', authenticateToken, updateConversation);

/**
 * @swagger
 * /api/conversations/{id}/messages:
 *   get:
 *     summary: Get messages for a conversation
 *     tags: [Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   content:
 *                     type: string
 *                   sender:
 *                     type: string
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not found
 */
router.get('/:id/messages', authenticateToken, getMessages);

export default router;
