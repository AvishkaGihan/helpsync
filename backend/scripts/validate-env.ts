import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import Stripe from "stripe";
import twilio from "twilio";

dotenv.config();

const requiredEnvVars = [
  "DATABASE_URL",
  "JWT_SECRET",
  "GEMINI_API_KEY",
  "STRIPE_SECRET_KEY",
  "TWILIO_ACCOUNT_SID",
  "TWILIO_AUTH_TOKEN",
  "TWILIO_PHONE_NUMBER",
  "ADMIN_PHONE_NUMBER",
];

async function validateEnv() {
  console.log("🔍 Validating environment variables...\n");

  let hasErrors = false;

  // Check required variables exist
  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      console.error(`❌ Missing: ${varName}`);
      hasErrors = true;
    } else {
      console.log(`✓ Found: ${varName}`);
    }
  }

  if (hasErrors) {
    console.error(
      "\n❌ Missing required environment variables. Check .env file."
    );
    process.exit(1);
  }

  console.log("\n🔍 Testing API connections...\n");

  // Test Gemini API
  try {
    const genAI = new GoogleGenAI({});
    await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "test",
    });
    console.log("✓ Gemini API: Connected");
  } catch (error) {
    console.error("❌ Gemini API: Failed -", (error as Error).message);
    hasErrors = true;
  }

  // Test Stripe API
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-09-30.clover",
    });
    await stripe.balance.retrieve();
    console.log("✓ Stripe API: Connected");
  } catch (error) {
    console.error("❌ Stripe API: Failed -", (error as Error).message);
    hasErrors = true;
  }

  // Test Twilio API
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
    await client.api.accounts(process.env.TWILIO_ACCOUNT_SID!).fetch();
    console.log("✓ Twilio API: Connected");
  } catch (error) {
    console.error("❌ Twilio API: Failed -", (error as Error).message);
    hasErrors = true;
  }

  if (hasErrors) {
    console.error("\n❌ Some API validations failed. Check your API keys.");
    process.exit(1);
  }

  console.log(
    "\n✅ All environment variables and APIs validated successfully!\n"
  );
}

validateEnv();
