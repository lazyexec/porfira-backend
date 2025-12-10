import Transaction from "../transaction/transaction.model.ts";
import Booking from "../booking/booking.model.ts";
import Review from "../review/review.model.ts";
import User from "../user/user.model.ts";
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
    totalEarnings: statsAggregate[0]?.totalAmount || 0, // Using "totalEarnings" key as requested, though it's spending
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

export const dashboardService = {
  getStudentStats,
  getTeacherStats,
};
