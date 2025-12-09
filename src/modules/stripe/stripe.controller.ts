import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import stripe from "../../configs/stripe.ts";
import ApiError from "../../utils/ApiError.ts";
import bookingService from "../booking/booking.service.ts";
import type { IUser } from "../user/user.interface.ts";
import stripeService from "./stripe.service.ts";

const webhook = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  if (!signature) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Missing stripe-signature header"
    );
  }

  let event;
  try {
    event = stripe.verifyWebhook(req, signature);
  } catch (err: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, `Webhook Error: ${err.message}`);
  }

  await stripeService.processWebHookStripe(event);

  res.status(httpStatus.OK).send();
});

const refundPayment = catchAsync(async (req: Request, res: Response) => {
  const user = req.user as unknown as IUser;
  // Admin only
  if (user?.role !== "admin") {
    throw new ApiError(httpStatus.FORBIDDEN, "Admin only");
  }

  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment Intent ID is required");
  }

  // Call stripe refund
  await stripe.refundPayment(paymentIntentId);

  // Update transaction + booking
  await bookingService.handleRefund(paymentIntentId);

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Refund processed successfully",
    })
  );
});

// Complete Teacher Wallet for Payment.
const completeTeacherWalletIntent = catchAsync(
  async (req: Request, res: Response) => {
    const teacher = req.user as unknown as IUser;
    if (!teacher || teacher?.role !== "teacher") {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
    }
    let stripeAccountId = teacher?.teacher?.stripeAccountId;
    if (!stripeAccountId) {
      stripeAccountId = await stripeService.createStripeAccount(teacher);
    }
    const intent = await stripeService.createOnboardingIntent(
      stripeAccountId as string
    );
    res.status(httpStatus.OK).json(
      response({
        status: httpStatus.OK,
        message: "Teacher wallet completed successfully",
        data: intent,
      })
    );
  }
);

export default {
  webhook,
  refundPayment,
  completeTeacherWalletIntent,
};
