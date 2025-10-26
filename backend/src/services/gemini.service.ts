import { GoogleGenAI } from "@google/genai";
import { Message } from "@prisma/client";
import { logger } from "../lib/logger";

export class GeminiService {
  private genAI: GoogleGenAI;

  constructor() {
    this.genAI = new GoogleGenAI({});
  }

  async generateResponse(
    userMessage: string,
    context: Message[],
    kbArticles: string[],
    language: string = "en"
  ): Promise<string> {
    try {
      const prompt = this.buildPrompt(
        userMessage,
        context,
        kbArticles,
        language
      );
      const result = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      return result.text || "";
    } catch (error) {
      logger.error("Gemini API error:", error);
      throw new Error("Failed to generate AI response");
    }
  }

  async analyzeSentiment(messageText: string): Promise<string | null> {
    try {
      const prompt = `Analyze the sentiment of this customer support message. Respond with only one word: positive, neutral, or negative.

Message: "${messageText}"

Sentiment:`;

      const result = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const sentiment = (result.text || "").trim().toLowerCase();

      if (["positive", "neutral", "negative"].includes(sentiment)) {
        return sentiment;
      }

      return "neutral";
    } catch (error) {
      logger.error("Sentiment analysis error:", error);
      return null;
    }
  }

  async detectLanguage(text: string): Promise<string> {
    try {
      const prompt = `Detect the language of this text. Respond with only the ISO 639-1 language code (en, es, fr, de, hi, etc.):

Text: "${text}"

Language code:`;

      const result = await this.genAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      const langCode = (result.text || "").trim().toLowerCase();

      return langCode || "en";
    } catch (error) {
      logger.error("Language detection error:", error);
      return "en";
    }
  }

  private buildPrompt(
    userMessage: string,
    context: Message[],
    kbArticles: string[],
    language: string
  ): string {
    const languageInstruction =
      language !== "en"
        ? `Respond in ${language} language (ISO 639-1 code: ${language}).`
        : "";

    return `You are a helpful customer support AI for HelpSync. ${languageInstruction}

Knowledge Base Context:
${kbArticles.length > 0 ? kbArticles.join("\n---\n") : "No knowledge base articles available."}

Recent Conversation:
${context.map((m) => `${m.senderType}: ${m.content}`).join("\n")}

Customer: ${userMessage}

Provide a helpful, natural response based on the knowledge base. If you cannot answer or the customer seems frustrated, politely suggest escalating to human support. Keep responses concise and friendly.`;
  }
}

// Singleton instance
export const geminiService = new GeminiService();
