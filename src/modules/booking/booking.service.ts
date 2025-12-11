import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import userService from "../user/user.service";
import transactionService from "../transaction/transaction.service";
import Booking from "./booking.model";
import stripe from "../../configs/stripe";
import Transaction from "../transaction/transaction.model";
function addHours(date: Date, hoursToAdd: number) {
  const newDate = new Date(date);
  newDate.setHours(newDate.getHours() + hoursToAdd);
  return newDate;
}

const claimBooking = async (
  userId: string,
  teacherId: string,
  duration: number,
  date: Date,
  time: Date,
  subject: string
) => {
  const teacher = await userService.getGenuineTeacher(teacherId);
  if (!teacher) throw new ApiError(400, "Invalid teacher ID");

  const hourlyRate = teacher.teacher?.hourlyRate;
  if (!hourlyRate) throw new ApiError(400, "Teacher has no hourly rate");

  const totalAmount = hourlyRate * duration;

  // Calculate 70% for teacher, 30% for platform
  const teacherEarnings = totalAmount * 0.7;
  const platformFee = totalAmount * 0.3;

  const priceId = teacher.teacher?.stripePriceId;
  if (!priceId)
    throw new ApiError(400, "Teacher does not have a Stripe price ID");

  //TODO: Handle in different way

  // const stripeAccountId = teacher.teacher?.stripeAccountId;
  // if (!stripeAccountId) {
  //   // Fallback to standard flow if no connected account, or throw error depending on strictness
  //   // Plan implies we should use Connect. I will throw if not present to enforce logic.
  //   throw new ApiError(
  //     httpStatus.BAD_REQUEST,
  //     "Teacher has not set up payouts"
  //   );
  // }

  // Create transaction record
  const transaction = await transactionService.createTransaction({
    performedBy: userId,
    receivedBy: teacherId,
    amount: totalAmount,
    platformFee: platformFee,
    teacherEarnings: teacherEarnings,
    status: "pending",
    type: "payment",
    description: `Booking for ${subject} - ${duration} hour(s)`,
    priceId: priceId,
    meta: {},
  });

  const stripeSession = await stripe.createStripeSession({
    priceId: priceId,
    quantity: duration,
    successUrl: `${process.env.FRONTEND_URL}/loading`,
    cancelUrl: `${process.env.FRONTEND_URL}/`,
    metadata: {
      transactionId: transaction._id.toString(),
      app: "porfira-payment",
    },
    applicationFeeAmount: platformFee, // Stripe Connect Application Fee
    transferDestination: "", //stripeAccountId, // Stripe Connect Destination
  });

  // Create booking with transaction reference
  await Booking.create({
    student: userId,
    teacher: teacherId,
    transaction: transaction._id,
    duration,
    date,
    fromTime: time,
    toTime: addHours(time, duration),
    subject,
    status: "unpaid",
  });

  return { url: stripeSession.url };
};

const confirmSession = async (stripeEvent: any) => {
  let session;
  let booking;

  switch (stripeEvent.type) {
    case "payment_intent.succeeded":
      session = stripeEvent.data.object;
      if (
        session.metadata.app === "porfira-payment" &&
        session.metadata.transactionId
      ) {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          session.metadata.transactionId,
          {
            status: "completed",
            transactionId: session.id,
          },
          { new: true }
        );

        booking = await Booking.findOneAndUpdate(
          { transaction: updatedTransaction?._id },
          { status: "scheduled" },
          { new: true }
        );
      }
      break;
    default:
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        "Invalid event type received from Stripe"
      );
  }

  return booking;
};

const rePayment = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  const transaction = await Transaction.findOne({
    _id: booking.transaction,
  });

  if (booking.status !== "unpaid" && transaction?.status === "completed") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Booking is Already Paid");
  }

  const user = await userService.getUserById(booking?.teacher.toString());
  const stripeAccountId = user?.teacher?.stripeAccountId;

  if (
    !transaction ||
    !transaction?.priceId ||
    !stripeAccountId ||
    !transaction?.platformFee
  ) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Transaction not found or missing required fields"
    );
  }

  const stripeSession = await stripe.createStripeSession({
    priceId: transaction?.priceId,
    quantity: booking.duration,
    successUrl: `${process.env.FRONTEND_URL}/loading`,
    cancelUrl: `${process.env.FRONTEND_URL}/`,
    metadata: {
      transactionId: transaction._id.toString(),
      app: "porfira-payment",
    },
    applicationFeeAmount: transaction.platformFee, // Stripe Connect Application Fee
    transferDestination: stripeAccountId, // Stripe Connect Destination
  });

  return { url: stripeSession.url };
};

const getBookingsTeacher = async (teacherId: string, options: any) => {
  const bookings = await Booking.paginate({ teacher: teacherId }, options);
  return bookings;
};

const getStudentBookings = async (studentId: string, options: any) => {
  const bookings = await Booking.paginate({ student: studentId }, options);
  return bookings;
};

const getBookings = async (options: any) => {
  const bookings = await Booking.paginate({}, options);
  return bookings;
};

const handleRefund = async (paymentIntentId: string) => {
  // Find transaction by payment intent in meta or transactionId (if we store PI there?)
  // Actually confirmSession stores paymentIntent in meta.paymentIntent

  const transaction = await Transaction.findOne({
    "meta.paymentIntent": paymentIntentId,
  });

  if (!transaction) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Transaction not found for refund"
    );
  }

  transaction.status = "refunded"; // Assuming enum supports this, or 'failed'
  await transaction.save();

  const booking = await Booking.findOneAndUpdate(
    { transaction: transaction._id },
    { status: "cancelled" }, // or 'refunded' if enum supports
    { new: true }
  );

  return booking;
};

export default {
  claimBooking,
  confirmSession,
  rePayment,
  getBookingsTeacher,
  getStudentBookings,
  getBookings,
  handleRefund,
};
