import mongoose from "mongoose";
import logger from "../../utils/logger";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import userService from "../user/user.service";
import Booking from "./booking.model";
import stripe from "../../configs/stripe";
import Transaction from "../transaction/transaction.model";
import notificationService from "../notification/notification.service";
import env from "../../configs/env";
import transactionService from "../transaction/transaction.service";
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
  if (duration < 1) throw new ApiError(400, "Duration must be at least 1 hour");

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

  let stripeAccountId = teacher.teacher?.stripeAccountId;
  if (!stripeAccountId && !env.DEBUG) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Teacher has not set up payouts"
    );
  } else {
    stripeAccountId = "ca_FkyHCg7X8mlvCUdMDao4mMxagUfhIwXb";
  }

  // Availability Check
  const fromTime = new Date(time);
  const toTime = addHours(fromTime, duration);
  const conflict = await Booking.findOne({
    teacher: teacherId,
    status: { $in: ["scheduled", "paid", "pending"] },
    $or: [
      { fromTime: { $lt: toTime, $gte: fromTime } },
      { toTime: { $gt: fromTime, $lte: toTime } },
    ],
  });

  if (conflict) {
    throw new ApiError(400, "Teacher is not available at this time");
  }

  try {
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

    // Create booking with transaction reference
    await Booking.create({
      student: userId,
      teacher: teacherId,
      transaction: transaction._id,
      duration,
      date,
      fromTime: fromTime,
      toTime: toTime,
      subject,
      status: "unpaid",
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
      // transferDestination: stripeAccountId, // Stripe Connect Destination
    });

    return { url: stripeSession.url };
  } catch (error) {
    throw error;
  }
};

const confirmSession = async (stripeEvent: any) => {
  let session;
  let booking;

  switch (stripeEvent.type) {
    case "payment_intent.succeeded":
    case "checkout.session.completed":
      session = stripeEvent.data.object;
      const transactionId = session.metadata?.transactionId;

      if (session.metadata?.app === "porfira-payment" && transactionId) {
        const existingTransaction = await Transaction.findById(transactionId);

        if (existingTransaction?.status === "completed") {
          return Booking.findOne({ transaction: existingTransaction._id });
        }

        const paymentIntentId =
          session.payment_intent ||
          (session.object === "payment_intent" ? session.id : null);

        const updatedTransaction = await Transaction.findByIdAndUpdate(
          transactionId,
          {
            status: "completed",
            transactionId: session.id, // Reference ID (Checkout Session or PI)
            "meta.paymentIntent": paymentIntentId,
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
  let stripeAccountId = user?.teacher?.stripeAccountId;

  if (!stripeAccountId && !env.DEBUG) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Teacher has not set up payouts"
    );
  } else {
    stripeAccountId = "ca_FkyHCg7X8mlvCUdMDao4mMxagUfhIwXb";
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
    // transferDestination: stripeAccountId, // Stripe Connect Destination
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
      try {
        const session = await stripe.stripe.checkout.sessions.retrieve(
          transaction.transactionId
        );
        if (session.payment_intent) {
          await stripe.refundPayment(session.payment_intent as string);
        } else {
          logger.error(
            `No payment intent found for session ${transaction.transactionId}`
          );
        }

        transaction.status = "refunded";
        transaction.type = "refund";
        await transaction.save();
      } catch (error: any) {
        logger.error(`Stripe refund failed: ${error.message}`);
        // Optionally throw or just log depending on business need
        // For now we log so the booking still gets cancelled locally
      }
    }
  }

  booking.status = "cancelled";
  await booking.save();

  // Send Notification
  const receiverId = isTeacher
    ? booking.student.toString()
    : booking.teacher.toString();

  await notificationService.createNotification(
    receiverId,
    "Booking Cancelled",
    `Your booking for ${booking.subject} has been cancelled by the ${
      isTeacher ? "teacher" : "student"
    }.${reason ? ` Reason: ${reason}` : ""}`,
    "personal"
  );

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

  // Send Notification
  const receiverId = isTeacher
    ? booking.student.toString()
    : booking.teacher.toString();

  await notificationService.createNotification(
    receiverId,
    "Booking Rescheduled",
    `Your booking for ${
      booking.subject
    } has been rescheduled to ${newFromTime.toLocaleString()}.`,
    "personal"
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
  completeBookingState,
  getBookingById,
  cancelBooking,
  rescheduleBooking,
};
