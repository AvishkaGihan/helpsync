import express from 'express';
import {
  getArticles,
  getArticle,
  searchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
} from '../controllers/knowledge-base.controller';
import { authenticateToken, requireRole } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @swagger
 * /api/knowledge-base:
 *   get:
 *     summary: Get all knowledge base articles
 *     tags: [Knowledge Base]
 *     responses:
 *       200:
 *         description: List of articles
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
 *                   content:
 *                     type: string
 */
router.get('/', getArticles);

/**
 * @swagger
 * /api/knowledge-base/search:
 *   get:
 *     summary: Search knowledge base articles
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 */
router.get('/search', searchArticles);

/**
 * @swagger
 * /api/knowledge-base/{id}:
 *   get:
 *     summary: Get a specific article
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Article details
 *       404:
 *         description: Not found
 */
router.get('/:id', getArticle);

/**
 * @swagger
 * /api/knowledge-base:
 *   post:
 *     summary: Create a new article (Admin only)
 *     tags: [Knowledge Base]
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
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Article created
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
router.post('/', authenticateToken, requireRole(['ADMIN']), createArticle);

/**
 * @swagger
 * /api/knowledge-base/{id}:
 *   put:
 *     summary: Update an article (Admin only)
 *     tags: [Knowledge Base]
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
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Article updated
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.put('/:id', authenticateToken, requireRole(['ADMIN']), updateArticle);

/**
 * @swagger
 * /api/knowledge-base/{id}:
 *   delete:
 *     summary: Delete an article (Admin only)
 *     tags: [Knowledge Base]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Article deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 */
router.delete('/:id', authenticateToken, requireRole(['ADMIN']), deleteArticle);

export default router;
