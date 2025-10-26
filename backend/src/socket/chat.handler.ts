import { Server, Socket } from "socket.io";
import { prisma } from "../lib/prisma";
import { geminiService } from "../services/gemini.service";
import { twilioService } from "../services/twilio.service";
import { authenticateSocketToken } from "../middleware/socket-auth.middleware";
import { logger } from "../lib/logger";

export const setupSocketHandlers = (io: Server) => {
  io.use(authenticateSocketToken);

  io.on("connection", (socket: Socket) => {
    logger.info(`User connected: ${socket.data.userId}`);

    socket.on("join_conversation", async (data: { conversationId: string }) => {
      try {
        const { conversationId } = data;

        // Verify user owns conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            userId: socket.data.userId,
          },
        });

        if (!conversation) {
          socket.emit("error", {
            code: "FORBIDDEN",
            message: "Not your conversation",
          });
          return;
        }

        socket.join(conversationId);
        logger.info(
          `User ${socket.data.userId} joined conversation ${conversationId}`
        );
      } catch (error) {
        logger.error("Join conversation error:", error);
        socket.emit("error", {
          code: "INTERNAL_ERROR",
          message: "Failed to join conversation",
        });
      }
    });

    socket.on(
      "send_message",
      async (data: { conversationId: string; content: string }) => {
        try {
          const { conversationId, content } = data;

          // Verify ownership
          const conversation = await prisma.conversation.findFirst({
            where: {
              id: conversationId,
              userId: socket.data.userId,
            },
          });

          if (!conversation) {
            socket.emit("error", {
              code: "FORBIDDEN",
              message: "Not your conversation",
            });
            return;
          }

          // Save user message
          const userMessage = await prisma.message.create({
            data: {
              conversationId,
              senderType: "USER",
              content,
            },
          });

          // Broadcast user message to others (not to sender)
          socket.to(conversationId).emit("new_message", userMessage);
          // Send confirmation back to sender
          socket.emit("new_message", userMessage);

          // Emit typing indicator
          io.to(conversationId).emit("typing_indicator", {
            conversationId,
            senderType: "AI",
          });

          // Analyze sentiment
          const sentiment = await geminiService.analyzeSentiment(content);
          if (sentiment) {
            await prisma.message.update({
              where: { id: userMessage.id },
              data: { sentiment },
            });
          }

          // Check for escalation (2 consecutive negative sentiments)
          if (sentiment === "negative") {
            const recentMessages = await prisma.message.findMany({
              where: {
                conversationId,
                senderType: "USER",
              },
              orderBy: { createdAt: "desc" },
              take: 2,
            });

            if (
              recentMessages.length === 2 &&
              recentMessages.every((m) => m.sentiment === "negative")
            ) {
              // Escalate conversation
              await prisma.conversation.update({
                where: { id: conversationId },
                data: {
                  status: "ESCALATED",
                  escalatedAt: new Date(),
                },
              });

              // Notify admin via SMS
              const user = await prisma.user.findUnique({
                where: { id: socket.data.userId },
              });

              if (user) {
                await twilioService.notifyEscalation(
                  conversationId,
                  user.email
                );
              }

              // Notify client
              io.to(conversationId).emit("conversation_escalated", {
                conversationId,
                escalatedAt: new Date().toISOString(),
                message:
                  "Your conversation has been escalated to a human support agent.",
              });
            }
          }

          // Generate AI response
          const context = await prisma.message.findMany({
            where: { conversationId },
            orderBy: { createdAt: "desc" },
            take: 5,
          });

          // Search knowledge base
          const kbResults = await prisma.knowledgeBaseArticle.findMany({
            where: {
              OR: [
                { title: { contains: content, mode: "insensitive" } },
                { content: { contains: content, mode: "insensitive" } },
              ],
            },
            take: 3,
          });

          const kbArticles = kbResults.map(
            (article) => `Title: ${article.title}\n${article.content}`
          );

          const aiResponse = await geminiService.generateResponse(
            content,
            context.reverse(),
            kbArticles,
            conversation.language
          );

          // Save AI message
          const aiMessage = await prisma.message.create({
            data: {
              conversationId,
              senderType: "AI",
              content: aiResponse,
            },
          });

          // Update conversation timestamp
          await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
          });

          // Broadcast AI message
          io.to(conversationId).emit("new_message", aiMessage);
        } catch (error) {
          logger.error("Send message error:", error);
          socket.emit("error", {
            code: "INTERNAL_ERROR",
            message: "Failed to send message",
          });
        }
      }
    );

    socket.on("typing", async (data: { conversationId: string }) => {
      const { conversationId } = data;
      socket.to(conversationId).emit("typing_indicator", {
        conversationId,
        senderType: "USER",
      });
    });

    socket.on("disconnect", () => {
      logger.info(`User disconnected: ${socket.data.userId}`);
    });
  });
};
