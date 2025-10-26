import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { HTTP_STATUS, ERROR_CODES } from "../utils/constants";

export const getSummary = async (req: Request, res: Response) => {
  try {
    const { period = "today" } = req.query;

    let startDate = new Date();
    if (period === "today") {
      startDate.setHours(0, 0, 0, 0);
    } else if (period === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    }

    const totalConversations = await prisma.conversation.count({
      where: { createdAt: { gte: startDate } },
    });

    const activeChats = await prisma.conversation.count({
      where: { status: "ACTIVE" },
    });

    const escalatedConversations = await prisma.conversation.count({
      where: {
        status: "ESCALATED",
        escalatedAt: { gte: startDate },
      },
    });

    const messages = await prisma.message.findMany({
      where: {
        createdAt: { gte: startDate },
        sentiment: { not: null },
      },
      select: { sentiment: true },
    });

    const sentimentCounts = messages.reduce((acc: any, msg) => {
      acc[msg.sentiment!] = (acc[msg.sentiment!] || 0) + 1;
      return acc;
    }, {});

    const totalMessages = await prisma.message.count({
      where: { createdAt: { gte: startDate } },
    });

    const avgMessagesPerConversation =
      totalConversations > 0 ? totalMessages / totalConversations : 0;

    res.json({
      totalConversations,
      activeChats,
      escalatedConversations,
      escalationRate:
        totalConversations > 0
          ? ((escalatedConversations / totalConversations) * 100).toFixed(2)
          : 0,
      sentimentDistribution: {
        positive: sentimentCounts.positive || 0,
        neutral: sentimentCounts.neutral || 0,
        negative: sentimentCounts.negative || 0,
      },
      averageMessagesPerConversation: avgMessagesPerConversation.toFixed(1),
      period,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to fetch analytics",
      },
    });
  }
};
