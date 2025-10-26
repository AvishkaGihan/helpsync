import twilio from "twilio";
import { logger } from "../lib/logger";

export class TwilioService {
  private client;

  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID!,
      process.env.TWILIO_AUTH_TOKEN!
    );
  }

  async sendSMS(to: string, message: string): Promise<void> {
    try {
      await this.client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER!,
        to,
      });
      logger.info(`SMS sent to ${to}`);
    } catch (error) {
      logger.error("Twilio SMS error:", error);
      // Don't throw - SMS failure shouldn't block escalation
    }
  }

  async notifyEscalation(
    conversationId: string,
    userEmail: string
  ): Promise<void> {
    const message = `🚨 Support escalation: Conversation ${conversationId} needs attention. Customer: ${userEmail}. Negative sentiment detected.`;

    await this.sendSMS(process.env.ADMIN_PHONE_NUMBER!, message);
  }
}

// Singleton instance
export const twilioService = new TwilioService();
