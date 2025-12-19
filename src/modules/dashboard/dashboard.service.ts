import Transaction from "../transaction/transaction.model";
import Booking from "../booking/booking.model";
import Review from "../review/review.model";
import User from "../user/user.model";
import mongoose from "mongoose";

/**
 * Get student dashboard statistics
 * @param studentId
 * @returns
 */
const getStudentStats = async (studentId: string) => {
  const currentDate = new Date();

  // Parallelize independent queries for better performance
  const [
    upcomingLessonCount,
    completedLessonCount,
    totalLessonCount,
    pendingLessonCount,
    givenReviewCount,
    upcomingLessons,
    statsAggregate,
  ] = await Promise.all([
    // 1. Upcoming lesson count
    Booking.countDocuments({
      student: studentId,
      status: "scheduled",
      fromTime: { $gte: currentDate },
    }),

    // 2. Completed lesson count
    Booking.countDocuments({
      student: studentId,
      status: "completed",
    }),

    // 3. Total lesson count (scheduled + completed + pending)
    Booking.countDocuments({
      student: studentId,
      status: { $in: ["scheduled", "completed", "pending"] },
    }),

    // 4. Pending lesson count (interpreted from "lessons completed from pending lessons" - maybe they want pending count)
    Booking.countDocuments({
      student: studentId,
      status: "pending",
    }),

    // 5. Given review count
    Review.countDocuments({
      fromUser: studentId,
    }),

    // 6. Array of 5 upcoming lessons
    Booking.find({
      student: studentId,
      status: "scheduled",
      fromTime: { $gte: currentDate },
    })
      .sort({ fromTime: 1 })
      .limit(5)
      .populate("teacher", "name avatar"),

    // 7. Total hours (sum of duration for completed lessons) & Total Spending
    Booking.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          status: "completed",
        },
      },
      {
        $lookup: {
          from: "transactions",
          localField: "transaction",
          foreignField: "_id",
          as: "transactionData",
        },
      },
      {
        $unwind: {
          path: "$transactionData",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: null,
          totalDuration: { $sum: "$duration" },
          totalAmount: { $sum: "$transactionData.amount" },
        },
      },
    ]),
  ]);

  const stats = {
    upcomingLesson: upcomingLessonCount,
    completedLesson: completedLessonCount,
    totalLesson: totalLessonCount,
    pendingLesson: pendingLessonCount,
    // givenReview: givenReviewCount,
    upcomingLessons,
    totalHours: statsAggregate[0]?.totalDuration || 0,
    totalSpending: statsAggregate[0]?.totalAmount || 0, // total Spending.
  };

  return stats;
};

/**
 * Get teacher dashboard statistics
 * @param teacherId
 * @returns
 */
const getTeacherStats = async (teacherId: string) => {
  const currentDate = new Date();

  const [
    totalStudents,
    upcomingLessonCount,
    completedLessonCount,
    upcomingLessons,
    earningsData,
  ] = await Promise.all([
    // 1. Total Students (distinct count)
    Booking.distinct("student", {
      teacher: teacherId,
      status: "completed",
    }).then((ids) => ids.length),

    // 3. Upcoming Lessons count
    Booking.countDocuments({
      teacher: teacherId,
      status: "scheduled",
      fromTime: { $gte: currentDate },
    }),

    // 4. Completed Lessons count
    Booking.countDocuments({
      teacher: teacherId,
      status: "completed",
    }),

    // 5. Array of 5 upcoming lessons
    Booking.find({
      teacher: teacherId,
      status: "scheduled",
      fromTime: { $gte: currentDate },
    })
      .sort({ fromTime: 1 })
      .limit(5)
      .populate("student", "name avatar"),

    // 2. Total Earnings (Sum of teacherEarnings)
    Transaction.aggregate([
      {
        $match: {
          receivedBy: new mongoose.Types.ObjectId(teacherId),
          status: "completed",
          // type: "payment" // Assuming bookings generate payment transactions
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$teacherEarnings" },
        },
      },
    ]),
  ]);

  const stats = {
    totalStudents,
    totalEarnings: earningsData[0]?.totalEarnings || 0,
    upcomingLesson: upcomingLessonCount,
    completedLesson: completedLessonCount,
    upcomingLessons,
  };

  return stats;
};

const getAdminStats = async () => {
  const currentDate = new Date();
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(currentDate.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const [
    totalStudents,
    totalTeachers,
    totalEarningsAggregate,
    monthlyEarnings,
    lastTransactions,
  ] = await Promise.all([
    User.countDocuments({
      role: "student",
      status: "active",
      isEmailVerified: true,
    }),

    User.countDocuments({
      role: "teacher",
      status: "active",
      isEmailVerified: true,
    }),

    Transaction.aggregate([
      {
        $match: {
          status: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$platformFee" },
        },
      },
    ]),

    // 4. Monthly Earnings for the last 12 months
    Transaction.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          earnings: { $sum: "$platformFee" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]),

    // 5. Last 10 Transactions
    Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("performedBy", "name avatar")
      .populate("receivedBy", "name avatar"),
  ]);

  const monthlyStats = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
    const found = monthlyEarnings.find(
      (item: any) =>
        `${item._id.year}-${String(item._id.month).padStart(2, "0")}` ===
        monthStr
    );
    monthlyStats.push({
      month: monthStr,
      earnings: found ? found.earnings : 0,
    });
  }

  const stats = {
    totalStudents,
    totalTeachers,
    totalEarnings: totalEarningsAggregate[0]?.totalEarnings || 0,
    monthlyEarnings: monthlyStats,
    lastTransactions,
  };

  return stats;
};

export const dashboardService = {
  getStudentStats,
  getTeacherStats,
  getAdminStats,
};
