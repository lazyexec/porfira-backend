import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import userService from "../user/user.service.ts";
import transactionService from "../transaction/transaction.service.ts";
import Booking from "./booking.model.ts";
import stripe from "../../configs/stripe.ts";
import Transaction from "../transaction/transaction.model.ts";

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

  const stripeSession = await stripe.createStripeSession({
    priceId: priceId,
    quantity: duration,
    successUrl: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      studentId: userId,
      teacherId: teacherId,
      teacherEarnings: teacherEarnings.toString(),
      platformFee: platformFee.toString(),
    },
  });

  // Create transaction record
  const transaction = await transactionService.createTransaction({
    performedBy: userId,
    receivedBy: teacherId,
    transactionId: stripeSession.id,
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
    fromTime: time,
    toTime: addHours(time, duration),
    subject,
    status: "unpaid",
  });

  return { url: stripeSession.url };
};

const confirmSession = async (stripeEvent: any) => {
  const session = stripeEvent.data.object;

  const stripeSessionId = session.id;
  const amount = session.amount_total / 100; // Convert from cents to dollars
  const teacherId = session.metadata.teacherId;
  const studentId = session.metadata.studentId;
  const teacherEarnings = parseFloat(session.metadata.teacherEarnings);
  const platformFee = parseFloat(session.metadata.platformFee);

  if (!teacherId || !studentId) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Missing metadata in Stripe session"
    );
  }

  const transaction = await Transaction.findOneAndUpdate(
    { transactionId: stripeSessionId },
    {
      status: "completed",
      meta: {
        paymentIntent: session.payment_intent,
        completedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!transaction) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Transaction not found for this session"
    );
  }

  // 2. Update the booking status to scheduled
  const booking = await Booking.findOneAndUpdate(
    { transaction: transaction._id },
    { status: "scheduled" },
    { new: true }
  );

  if (!booking) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Booking not found for this transaction"
    );
  }

  await userService.syncTeacherBalance(teacherId, teacherEarnings);

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

  if (booking.status === "unpaid" && transaction?.status === "completed") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Booking is Already Paid");
  }

  if (
    !transaction ||
    !transaction?.priceId ||
    !transaction?.teacherEarnings ||
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
    successUrl: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: `${process.env.FRONTEND_URL}/cancel`,
    metadata: {
      studentId: booking.student.toString(),
      teacherId: booking.teacher.toString(),
      teacherEarnings: transaction.teacherEarnings.toString(),
      platformFee: transaction.platformFee.toString(),
    },
  });

  transaction.transactionId = stripeSession.id;
  await transaction.save();
  return { url: stripeSession.url };
};

export default {
  claimBooking,
  confirmSession,
  rePayment,
};
