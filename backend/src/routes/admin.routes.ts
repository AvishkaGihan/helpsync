import express from "express";
import bcrypt from "bcrypt";
import { prisma } from "../lib/prisma";

const router = express.Router();

// Middleware to check if admin is logged in
const isAuthenticated = (req: any, res: any, next: any) => {
  if (req.session.adminId) {
    return next();
  }
  res.redirect("/admin/login");
};

// Login page
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

// Login POST
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email, role: "ADMIN" },
    });

    if (!user) {
      return res.render("admin/login", {
        error: "Invalid credentials",
      });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.render("admin/login", {
        error: "Invalid credentials",
      });
    }

    req.session.adminId = user.id;
    req.session.adminEmail = user.email;
    res.redirect("/admin/dashboard");
  } catch (error) {
    res.render("admin/login", {
      error: "Login failed",
    });
  }
});

// Dashboard
router.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const activeConversations = await prisma.conversation.count({
      where: { status: "ACTIVE" },
    });

    const totalMessages = await prisma.message.count();
    const resolvedConversations = await prisma.conversation.count({
      where: { status: "RESOLVED" },
    });
    const totalConversations = await prisma.conversation.count();

    const resolutionRate =
      totalConversations > 0
        ? ((resolvedConversations / totalConversations) * 100).toFixed(1)
        : 0;

    const escalations = await prisma.conversation.count({
      where: { status: "ESCALATED" },
    });

    res.render("admin/dashboard", {
      metrics: {
        activeConversations,
        totalMessages,
        resolutionRate,
        escalations,
      },
      adminEmail: req.session.adminEmail,
    });
  } catch (error) {
    res.status(500).send("Failed to load dashboard");
  }
});

// Conversations list
router.get("/conversations", isAuthenticated, async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        user: {
          select: { email: true },
        },
        _count: {
          select: { messages: true },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 50,
    });

    res.render("admin/conversations", {
      conversations,
      adminEmail: req.session.adminEmail,
    });
  } catch (error) {
    res.status(500).send("Failed to load conversations");
  }
});

// Conversation detail
router.get("/conversations/:id", isAuthenticated, async (req, res) => {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { email: true, createdAt: true },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!conversation) {
      return res.status(404).send("Conversation not found");
    }

    res.render("admin/conversation-detail", {
      conversation,
      adminEmail: req.session.adminEmail,
    });
  } catch (error) {
    res.status(500).send("Failed to load conversation");
  }
});

// Knowledge base
router.get("/knowledge-base", isAuthenticated, async (req, res) => {
  try {
    const articles = await prisma.knowledgeBaseArticle.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.render("admin/knowledge-base", {
      articles,
      adminEmail: req.session.adminEmail,
    });
  } catch (error) {
    res.status(500).send("Failed to load knowledge base");
  }
});

// Knowledge base API routes (session-based for admin panel)
router.post("/api/knowledge-base", isAuthenticated, async (req, res) => {
  try {
    const { title, content, category, keywords } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        error: {
          code: "VALIDATION_ERROR",
          message: "Title and content are required",
        },
      });
    }

    const adminId = req.session.adminId!; // Guaranteed by isAuthenticated middleware

    const article = await prisma.knowledgeBaseArticle.create({
      data: {
        title,
        content,
        category: category || null,
        keywords: keywords || [],
        createdBy: adminId,
      },
    });

    res.status(201).json(article);
  } catch (error) {
    console.error("Error creating article:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to create article",
      },
    });
  }
});

router.put("/api/knowledge-base/:id", isAuthenticated, async (req, res) => {
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
    console.error("Error updating article:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to update article",
      },
    });
  }
});

router.delete("/api/knowledge-base/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.knowledgeBaseArticle.delete({
      where: { id },
    });

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting article:", error);
    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to delete article",
      },
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default router;
