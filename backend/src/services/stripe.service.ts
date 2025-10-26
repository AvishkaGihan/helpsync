import Stripe from "stripe";
import { logger } from "../lib/logger";

export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2025-09-30.clover",
    });
  }

  async createPaymentIntent(amount: number): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
      });
    } catch (error) {
      logger.error("Stripe payment intent creation error:", error);
      throw new Error("Failed to create payment intent");
    }
  }

  async retrievePayment(paymentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentId);
    } catch (error) {
      logger.error("Stripe payment retrieval error:", error);
      throw new Error("Failed to retrieve payment");
    }
  }

  async processRefund(
    paymentId: string,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      return await this.stripe.refunds.create({
        payment_intent: paymentId,
        reason: "requested_by_customer",
      });
    } catch (error) {
      logger.error("Stripe refund error:", error);
      throw new Error("Failed to process refund");
    }
  }
}

// Singleton instance
export const stripeService = new StripeService();
