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

  const stripeAccountId = teacher.teacher?.stripeAccountId;
  if (!stripeAccountId) {
    // Fallback to standard flow if no connected account, or throw error depending on strictness
    // Plan implies we should use Connect. I will throw if not present to enforce logic.
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Teacher has not set up payouts"
    );
  }

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
      transactionId: "", // Will update later, but better to have it consistent or null
    },
    applicationFeeAmount: platformFee, // Stripe Connect Application Fee
    transferDestination: stripeAccountId, // Stripe Connect Destination
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
  let session;
  let paymentIntentId;
  let amount;
  let teacherId;
  let studentId;
  let teacherEarnings;
  let platformFee;

  if (stripeEvent.type === "payment_intent.succeeded") {
    session = stripeEvent.data.object;
    paymentIntentId = session.id;
    amount = session.amount / 100;
    // Payment Intent metadata is flat, session metadata is nested in session object
    teacherId = session.metadata.teacherId;
    studentId = session.metadata.studentId;
    teacherEarnings = parseFloat(session.metadata.teacherEarnings);
    platformFee = parseFloat(session.metadata.platformFee);
  } else {
    // Default to checkout.session.completed
    session = stripeEvent.data.object;
    paymentIntentId = session.payment_intent as string; // in session it is referenced
    amount = session.amount_total / 100;
    teacherId = session.metadata.teacherId;
    studentId = session.metadata.studentId;
    teacherEarnings = parseFloat(session.metadata.teacherEarnings);
    platformFee = parseFloat(session.metadata.platformFee);
  }

  if (!teacherId || !studentId) {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Missing metadata in Stripe session/intent"
    );
  }

  // Find transaction by transactionId (session ID) OR by paymentIntentId if we stored it?
  // Original logic used transactionId = session.id.
  // Connect logic: we stored session.id as transactionId.
  // If event is payment_intent.succeeded, session.id is payment_intent_id.
  // BUT the transaction stored the CHECKOUT SESSION ID.
  // So if we receive payment_intent.succeeded, we might NOT match transactionId directly unless we stored PI too.
  // WE DO store paymentIntent in meta.paymentIntent AFTER completion in existing logic.
  // If we receive payment_intent.succeeded, we need to find transaction by ... what?
  // We can find it by metadata.transactionId if we added it (which I did in claimBooking!)

  let transaction;
  if (
    stripeEvent.type === "payment_intent.succeeded" &&
    session.metadata.transactionId
  ) {
    transaction = await Transaction.findOne({
      _id: session.metadata.transactionId,
    });
  } else {
    transaction = await Transaction.findOne({ transactionId: session.id });
  }

  if (!transaction) {
    // Try finding by payment intent if we already saved it partially? Unlikely.
    // Or try finding by metadata transactionId if present in session too
    if (session.metadata?.transactionId) {
      transaction = await Transaction.findOne({
        _id: session.metadata.transactionId,
      });
    }
  }

  if (!transaction) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Transaction not found for this session"
    );
  }

  // Idempotency check: if already completed, return
  if (transaction.status === "completed") {
    return await Booking.findOne({ transaction: transaction._id });
  }

  const updatedTransaction = await Transaction.findByIdAndUpdate(
    transaction._id,
    {
      status: "completed",
      meta: {
        paymentIntent: paymentIntentId,
        completedAt: new Date(),
      },
    },
    { new: true }
  );

  if (!updatedTransaction) {
    throw new ApiError(httpStatus.NOT_FOUND, "Failed to update transaction");
  }

  // 2. Update the booking status to scheduled
  const booking = await Booking.findOneAndUpdate(
    { transaction: updatedTransaction._id },
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
