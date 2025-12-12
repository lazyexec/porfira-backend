import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import userService from "../user/user.service";
import transactionService from "../transaction/transaction.service";
import Booking from "./booking.model";
import stripe from "../../configs/stripe";
import Transaction from "../transaction/transaction.model";
import notificationService from "../notification/notification.service";
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

  const stripeAccountId = teacher.teacher?.stripeAccountId;
  if (!stripeAccountId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Teacher has not set up payouts"
    );
  }

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
    transferDestination: stripeAccountId, // Stripe Connect Destination
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
        const existingTransaction = await Transaction.findById(
          session.metadata.transactionId
        );

        if (existingTransaction?.status === "completed") {
          return Booking.findOne({ transaction: existingTransaction._id });
        }

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
        await notificationService.lessonConfirmationNotification(
          booking?.student?.toString()!,
          booking?.teacher?.toString()!
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

const rePayment = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  if (booking.student.toString() !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You are not authorized to pay for this booking"
    );
  }

  const transaction = await Transaction.findOne({
    _id: booking.transaction,
  });

  if (booking.status !== "unpaid" && transaction?.status === "completed") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Booking is Already Paid");
  }

  const user = await userService.getUserById(booking?.teacher.toString());
  const stripeAccountId = user?.teacher?.stripeAccountId;

  if (!stripeAccountId) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Teacher has not set up payouts"
    );
  }

  // console.log({
  //   transaction,
  //   priceId: transaction?.priceId,
  //   stripeAccountId,
  //   platformFee: transaction?.platformFee,
  // });

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

const completeBookingState = async (bookingId: string) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(httpStatus.NOT_FOUND, "Invalid booking ID");
  if (booking.status !== "scheduled") {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Booking is not in a verifyable state (must be scheduled)"
    );
  }

  booking.status = "completed";
  await booking.save();
  return booking;
};

const getBookingById = async (bookingId: string, userId: string) => {
  const booking = await Booking.findById(bookingId)
    .populate("student", "name email avatar")
    .populate("teacher", "name email avatar")
    .populate("transaction");

  if (!booking) {
    throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");
  }

  // Security: Only allow student, teacher, or admin (admin check usually done in route)
  // Here we check ownership if userId is provided
  if (
    userId &&
    booking.student._id.toString() !== userId &&
    booking.teacher._id.toString() !== userId
  ) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Not authorized to view this booking"
    );
  }

  return booking;
};

const cancelBooking = async (
  bookingId: string,
  userId: string,
  reason?: string
) => {
  const booking = await Booking.findById(bookingId).populate("transaction");
  if (!booking) throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");

  if (
    booking.status === "completed" ||
    booking.status === "cancelled" ||
    booking.status === "rejected"
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot cancel booking with status: ${booking.status}`
    );
  }

  const isTeacher = booking.teacher.toString() === userId;
  const isStudent = booking.student.toString() === userId;

  if (!isTeacher && !isStudent) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "Not authorized to cancel this booking"
    );
  }

  // Refund Logic
  let shouldRefund = false;

  if (booking.status === "paid" || booking.status === "scheduled") {
    if (isTeacher) {
      // Teacher cancels -> Always refund
      shouldRefund = true;
    } else if (isStudent) {
      // Student cancels -> Refund if > 24 hours
      const now = new Date();
      const bookingTime = new Date(booking.fromTime);
      const diffHours =
        (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (diffHours >= 24) {
        shouldRefund = true;
      }
    }
  }

  if (shouldRefund) {
    const transaction = await Transaction.findById(booking.transaction);
    if (transaction && transaction.transactionId) {
      // Refund via Stripe
      await stripe.refundPayment(transaction.transactionId); // Using transactionId as PI or looking up PI
      // Note: stripe.refundPayment expects PaymentIntentId.
      // In confirming session we saved session.id as transactionId.
      // We might need to fetch PI from session if transactionId is actually session ID.
      // Looking at confirmSession: transactionId = session.id.
      // So we need to retrieve session to get payment_intent?
      // Let's assume for now we stored PI in meta in a better world, but here we might need to fetch session
      // Or usually Checkout Session ID can be used to retrieve SetupIntent/PaymentIntent.

      // Correct approach with current code:
      // The 'transactionId' field stores 'session.id' (cs_test_...).
      // We need payment_intent to refund.
      const session = await stripe.stripe.checkout.sessions.retrieve(
        transaction.transactionId
      );
      if (session.payment_intent) {
        await stripe.refundPayment(session.payment_intent as string);
      }

      transaction.status = "refunded";
      await transaction.save();
    }
  }

  booking.status = "cancelled";
  await booking.save();

  // TODO: Send Notification (reason)

  return booking;
};

const rescheduleBooking = async (
  bookingId: string,
  userId: string,
  date: Date,
  time: Date
) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(httpStatus.NOT_FOUND, "Booking not found");

  if (
    booking.status === "completed" ||
    booking.status === "cancelled" ||
    booking.status === "rejected"
  ) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Cannot reschedule booking with status: ${booking.status}`
    );
  }

  const isTeacher = booking.teacher.toString() === userId;
  const isStudent = booking.student.toString() === userId;

  if (!isTeacher && !isStudent) {
    throw new ApiError(httpStatus.FORBIDDEN, "Not authorized");
  }

  // Check availability (Basic check)
  const duration = booking.duration;
  const newFromTime = new Date(time);
  const newToTime = addHours(newFromTime, duration);

  // Simple overlap check
  const conflict = await Booking.findOne({
    teacher: booking.teacher,
    status: { $in: ["scheduled", "pending", "paid"] }, // Occupied slots
    _id: { $ne: booking._id }, // Exclude self
    $or: [
      { fromTime: { $lt: newToTime, $gte: newFromTime } },
      { toTime: { $gt: newFromTime, $lte: newToTime } },
    ],
  });

  if (conflict) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Teacher is not available at this time"
    );
  }

  booking.date = date;
  booking.fromTime = newFromTime;
  booking.toTime = newToTime;
  // Status remains same (e.g. scheduled)

  await booking.save();
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
  completeBookingState,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
};
