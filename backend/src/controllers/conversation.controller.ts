import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS, ERROR_CODES } from "../utils/constants";

export const createConversation = async (req: Request, res: Response) => {
  try {
    const { title } = req.body;

    const conversation = await prisma.conversation.create({
      data: {
        userId: req.user!.userId,
        title: title || "New Conversation",
      },
    });

    res.status(HTTP_STATUS.CREATED).json(conversation);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to create conversation",
      },
    });
  }
};

export const getConversations = async (req: Request, res: Response) => {
  try {
    const { status, limit = "20", offset = "0" } = req.query;

    const where: any = { userId: req.user!.userId };
    if (status) where.status = status;

    const conversations = await prisma.conversation.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: parseInt(limit as string),
      skip: parseInt(offset as string),
      include: {
        _count: {
          select: { messages: true },
        },
      },
    });

    const total = await prisma.conversation.count({ where });

    res.json({
      conversations: conversations.map((c) => ({
        ...c,
        messageCount: c._count.messages,
      })),
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch conversations",
      },
    });
  }
};

export const getConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: "Conversation not found",
        },
      });
    }

    if (
      conversation.userId !== req.user!.userId &&
      req.user!.role !== "ADMIN"
    ) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: "Access denied",
        },
      });
    }

    res.json(conversation);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch conversation",
      },
    });
  }
};

export const updateConversation = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, status } = req.body;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: "Conversation not found",
        },
      });
    }

    if (
      conversation.userId !== req.user!.userId &&
      req.user!.role !== "ADMIN"
    ) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: "Access denied",
        },
      });
    }

    const updated = await prisma.conversation.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(status && { status }),
      },
    });

    res.json(updated);
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to update conversation",
      },
    });
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = "50", before } = req.query;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
    });

    if (!conversation) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        error: {
          code: ERROR_CODES.NOT_FOUND,
          message: "Conversation not found",
        },
      });
    }

    if (
      conversation.userId !== req.user!.userId &&
      req.user!.role !== "ADMIN"
    ) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        error: {
          code: ERROR_CODES.FORBIDDEN,
          message: "Access denied",
        },
      });
    }

    const where: any = { conversationId: id };
    if (before) {
      where.createdAt = { lt: new Date(before as string) };
    }

    const messages = await prisma.message.findMany({
      where,
      orderBy: { createdAt: "asc" },
      take: parseInt(limit as string),
    });

    const total = await prisma.message.count({ where: { conversationId: id } });

    res.json({
      messages,
      total,
      hasMore: messages.length === parseInt(limit as string),
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch messages",
      },
    });
  }
};

export const getEscalatedConversations = async (
  req: Request,
  res: Response
) => {
  try {
    const conversations = await prisma.conversation.findMany({
      where: { status: "ESCALATED" },
      orderBy: { escalatedAt: "desc" },
      include: {
        user: {
          select: { email: true },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        _count: {
          select: { messages: true },
        },
      },
    });

    res.json({
      conversations: conversations.map((c) => ({
        id: c.id,
        userId: c.userId,
        user: c.user,
        title: c.title,
        status: c.status,
        escalatedAt: c.escalatedAt,
        messageCount: c._count.messages,
        lastMessage: c.messages[0] || null,
      })),
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch escalated conversations",
      },
    });
  }
};
