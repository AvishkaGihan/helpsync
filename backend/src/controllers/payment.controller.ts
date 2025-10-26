import { Request, Response } from "express";
import { stripeService } from "../services/stripe.service";
import { HTTP_STATUS, ERROR_CODES } from "../utils/constants";

export const createDemoPayment = async (req: Request, res: Response) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 50) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: {
          code: ERROR_CODES.VALIDATION_ERROR,
          message: "Amount must be at least 50 cents",
        },
      });
    }

    const paymentIntent = await stripeService.createPaymentIntent(amount);

    res.json({
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to create payment",
      },
    });
  }
};

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;

    const payment = await stripeService.retrievePayment(paymentId);

    res.json({
      paymentIntentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      created: new Date(payment.created * 1000).toISOString(),
    });
  } catch (error) {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      error: {
        code: ERROR_CODES.NOT_FOUND,
        message: "Payment not found",
      },
    });
  }
};

export const processRefund = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.params;
    const { reason } = req.body;

    const refund = await stripeService.processRefund(paymentId, reason);

    res.json({
      refundId: refund.id,
      paymentIntentId: refund.payment_intent,
      amount: refund.amount,
      status: refund.status,
      reason: reason || "requested_by_customer",
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_ERROR).json({
      error: {
        code: ERROR_CODES.INTERNAL_ERROR,
        message: "Failed to process refund",
      },
    });
  }
};
