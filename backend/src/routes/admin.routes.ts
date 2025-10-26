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

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

export default router;
