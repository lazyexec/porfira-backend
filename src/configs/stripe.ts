import Stripe from "stripe";
import env from "../configs/env.ts";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-11-17.clover",
});

// Create checkout session
const createStripeSession = async ({
  priceId,
  quantity,
  successUrl,
  cancelUrl,
  metadata = {},
}: {
  priceId: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, string>;
}) => {
  return await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        price: priceId,
        quantity,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  });
};

// Verify Stripe webhook
const verifyWebhook = (req: any, signature: string) => {
  return stripe.webhooks.constructEvent(
    req.body, // rawBody must be enabled in Express config
    signature,
    env.STRIPE_WEBHOOK_SECRET
  );
};

// Fetch Payment Intent
const getPaymentIntent = async (paymentIntentId: string) => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

// Issue refund
// const refundPayment = async (paymentIntentId: string, amount?: number) => {
//   return await stripe.refunds.create({
//     payment_intent: paymentIntentId,
//     amount,
//   });
// };

// Transfer teacher earnings (if using Stripe Connect)
const transferToTeacher = async (
  teacherStripeAccountId: string,
  amount: number
) => {
  return await stripe.transfers.create({
    amount,
    currency: "usd",
    destination: teacherStripeAccountId,
  });
};

export default {
  stripe,
  createStripeSession,
  verifyWebhook,
  // refundPayment,
  getPaymentIntent,
  transferToTeacher,
};
