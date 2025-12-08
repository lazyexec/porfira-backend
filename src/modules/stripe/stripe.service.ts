import type { IUser } from "../user/user.interface.ts";
import logger from "../../utils/logger.ts";
import stripe from "../../configs/stripe.ts";
import User from "../user/user.model.ts";
import bookingService from "../booking/booking.service.ts";

const createStripeAccount = async (user: IUser) => {
  const account = await stripe.createAccountForTeacher({
    email: user.email,
    country: "US",
  });

  if (!account || !account.id) {
    logger.error(`Failed to create Stripe account for user ${user.email}`);
    return;
  }
  return account.id;
};

const createOnboardingIntent = async (teacherStripeAccountId: string) => {
  const intent = await stripe.createOnboardingLink(teacherStripeAccountId);
  return intent;
};

const processWebHookStripe = async (event: any) => {
  switch (event.type) {
    case "account.updated": {
      const account = event.data.object as any;
      if (account.details_submitted) {
        await User.findOneAndUpdate(
          { "teacher.stripeAccountId": account.id },
          {
            "teacher.stripeOnboardingComplete": true,
            "teacher.stripePayoutsEnabled": account.payouts_enabled,
          }
        );
      }
      break;
    }
    case "payment_intent.succeeded": {
      // Handle payment intent success
      await bookingService.confirmSession(event);
      break;
    }
    case "checkout.session.completed": {
      await bookingService.confirmSession(event);
      break;
    }
    case "charge.refunded": {
      // await bookingService.handleRefundHook(event.data.object);
      break;
    }
  }
};

export default {
  createStripeAccount,
  createOnboardingIntent,
  processWebHookStripe,
};
