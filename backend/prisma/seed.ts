import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: {},
    create: {
      email: "admin@demo.com",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("✓ Created admin user:", admin.email);

  // Create customer user
  const customerPassword = await bcrypt.hash("Customer123!", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@demo.com" },
    update: {},
    create: {
      email: "customer@demo.com",
      passwordHash: customerPassword,
      role: "CUSTOMER",
    },
  });
  console.log("✓ Created customer user:", customer.email);

  // Create knowledge base articles
  const articles = [
    {
      title: "How to Reset Your Password",
      content: `To reset your password, follow these steps:
1. Go to the login page
2. Click on "Forgot Password"
3. Enter your email address
4. Check your email for a reset link
5. Click the link and create a new password

If you don't receive the email within 5 minutes, check your spam folder.`,
      category: "Account Issues",
      keywords: ["password", "reset", "login", "forgot"],
    },
    {
      title: "Payment Methods Accepted",
      content: `We accept the following payment methods:
- Credit Cards (Visa, Mastercard, American Express)
- Debit Cards
- PayPal
- Apple Pay
- Google Pay

All payments are securely processed through Stripe.`,
      category: "Billing",
      keywords: ["payment", "credit card", "billing", "pay"],
    },
    {
      title: "How to Track Your Order",
      content: `You can track your order by:
1. Logging into your account
2. Going to "My Orders"
3. Clicking on the order you want to track
4. View the tracking number and status

You'll also receive tracking updates via email.`,
      category: "Shipping",
      keywords: ["tracking", "order", "shipping", "delivery"],
    },
    {
      title: "Return Policy",
      content: `Our return policy:
- 30-day return window from delivery date
- Items must be unused and in original packaging
- Free return shipping for defective items
- Refunds processed within 5-7 business days

To initiate a return, contact support with your order number.`,
      category: "Returns",
      keywords: ["return", "refund", "exchange", "cancel"],
    },
    {
      title: "Account Security Best Practices",
      content: `Keep your account secure:
- Use a strong, unique password
- Enable two-factor authentication
- Never share your password
- Log out from shared devices
- Review account activity regularly

Contact us immediately if you notice suspicious activity.`,
      category: "Account Issues",
      keywords: ["security", "password", "account", "safety"],
    },
    {
      title: "Subscription Management",
      content: `To manage your subscription:
- Log into your account
- Go to Settings > Subscription
- You can upgrade, downgrade, or cancel anytime
- Changes take effect at the next billing cycle
- No cancellation fees

Pro-rated refunds are available for annual plans.`,
      category: "Billing",
      keywords: ["subscription", "billing", "cancel", "upgrade"],
    },
    {
      title: "Technical Support",
      content: `For technical issues:
1. Clear your browser cache and cookies
2. Try a different browser
3. Check your internet connection
4. Update to the latest app version
5. Contact support if issues persist

Our tech support team is available 24/7.`,
      category: "Technical Support",
      keywords: ["technical", "bug", "error", "not working"],
    },
    {
      title: "Shipping Times and Costs",
      content: `Shipping information:
- Standard shipping: 5-7 business days ($5.99)
- Express shipping: 2-3 business days ($14.99)
- Free shipping on orders over $50
- International shipping available

Orders placed before 2 PM ship same day.`,
      category: "Shipping",
      keywords: ["shipping", "delivery", "cost", "time"],
    },
    {
      title: "Contact Information",
      content: `Get in touch with us:
- Email: support@helpsync.com
- Phone: 1-800-HELP-SYNC
- Live Chat: Available 24/7 in app
- Social Media: @helpsync

Average response time: Under 2 hours`,
      category: "General",
      keywords: ["contact", "support", "help", "phone"],
    },
    {
      title: "Account Deletion",
      content: `To delete your account:
1. Go to Settings > Account
2. Click "Delete Account"
3. Confirm deletion
4. Your data will be permanently removed within 30 days

Note: This action cannot be undone. Export your data first if needed.`,
      category: "Account Issues",
      keywords: ["delete", "account", "remove", "close"],
    },
  ];

  for (const article of articles) {
    await prisma.knowledgeBaseArticle.upsert({
      where: { id: `demo-${article.title.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        ...article,
        createdBy: admin.id,
      },
    });
  }
  console.log(`✓ Created ${articles.length} knowledge base articles`);

  // Create demo conversations
  const conversation1 = await prisma.conversation.create({
    data: {
      userId: customer.id,
      title: "Password Reset Help",
      status: "RESOLVED",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation1.id,
        senderType: "USER",
        content: "I forgot my password. How do I reset it?",
        sentiment: "neutral",
      },
      {
        conversationId: conversation1.id,
        senderType: "AI",
        content:
          'I can help you reset your password! Go to the login page and click "Forgot Password". Enter your email address and you\'ll receive a reset link within a few minutes.',
        sentiment: null,
      },
      {
        conversationId: conversation1.id,
        senderType: "USER",
        content: "Thanks! That worked perfectly.",
        sentiment: "positive",
      },
    ],
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      userId: customer.id,
      title: "Order Tracking",
      status: "ACTIVE",
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation2.id,
        senderType: "USER",
        content: "Where is my order? Order #12345",
        sentiment: "neutral",
      },
      {
        conversationId: conversation2.id,
        senderType: "AI",
        content:
          "I'd be happy to help you track your order! You can track order #12345 by logging into your account and going to \"My Orders\". You'll see the tracking number and current status there.",
        sentiment: null,
      },
    ],
  });

  console.log("✓ Created demo conversations with messages");
  console.log("\n=== Demo Accounts ===");
  console.log("Admin: admin@demo.com / Admin123!");
  console.log("Customer: customer@demo.com / Customer123!");
  console.log("\nSeeding completed successfully! 🎉");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
