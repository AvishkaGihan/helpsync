import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS, ERROR_CODES } from "../utils/constants";

export const getArticles = async (req: Request, res: Response) => {
  try {
    const { category, limit = "20", offset = "0" } = req.query;

    const where: any = {};
    if (category) where.category = category;

    const articles = await prisma.knowledgeBaseArticle.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
    });

    const total = await prisma.knowledgeBaseArticle.count({ where });

    res.json({ articles, total });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch articles",
      },
    });
  }
};

export const getArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const article = await prisma.knowledgeBaseArticle.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!article) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: "Article not found",
        },
      });
    }

    res.json(article);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch article",
      },
    });
  }
};

export const searchArticles = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.json({ articles: [], query: "" });
    }

    const searchQuery = q as string;

    const articles = await prisma.knowledgeBaseArticle.findMany({
      where: {
        OR: [
          { title: { contains: searchQuery, mode: "insensitive" } },
          { content: { contains: searchQuery, mode: "insensitive" } },
          { keywords: { has: searchQuery.toLowerCase() } },
        ],
      },
      take: 5,
    });

    res.json({
      articles: articles.map((a) => ({
        ...a,
        snippet: a.content.substring(0, 150) + "...",
        relevanceScore: 0.95, // Simplified - would calculate actual score in production
      })),
      query: searchQuery,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Search failed",
      },
    });
  }
};

export const createArticle = async (req: Request, res: Response) => {
  try {
    const { title, content, category, keywords } = req.body;

    if (!title || !content) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "Title and content are required",
        },
      });
    }

    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        title,
        content,
        category,
        keywords: keywords || [],
        createdBy: req.user!.userId,
      },
    });

    res.status(HTTP_STATUS.CREATED).json(article);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to create article",
      },
    });
  }
};

export const updateArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, category, keywords } = req.body;

    const article = await prisma.knowledgeBaseArticle.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(content && { content }),
        ...(category !== undefined && { category }),
        ...(keywords && { keywords }),
      },
    });

    res.json(article);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to update article",
      },
    });
  }
};

export const deleteArticle = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.knowledgeBaseArticle.delete({
      where: { id },
    });

    res.status(HTTP_STATUS.NO_CONTENT).send();
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to delete article",
      },
    });
  }
};
