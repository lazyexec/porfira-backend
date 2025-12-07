import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import userService from "../user/user.service.ts";
import transactionService from "../transaction/transaction.service.ts";
import Lesson from "./lesson.model.ts";

const claimLesson = async (
  userId: string,
  teacherId: string,
  duration: number
) => {
  const teacher = await userService.getGenuineTeacher(teacherId);
  if (!teacher) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid teacher ID");
  }
  const hourlyRate = teacher?.teacher?.hourlyRate;
  if (hourlyRate === undefined || hourlyRate === null) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Teacher does not have an hourly rate set"
    );
  }

  const purchaseAmount = hourlyRate * duration;

  const newTransaction = {
    performedBy: userId,
    receivedBy: teacherId,
    transactionId: `txn_${Date.now()}`,
    amount: purchaseAmount,
    teacherEarnings: purchaseAmount * 0.7, // 70% to teacher
    platformFee: purchaseAmount * 0.3, // 30% platform fee
    status: "pending",
    type: "payment",
    description: `Payment for ${duration} hour(s) lesson with teacher ${teacherId}`,
  };

  const transaction = await transactionService.createTransaction(
    newTransaction
  );
  const lesson = await Lesson.create({
    teacher: teacherId,
    student: userId,
    duration,
    transaction: transaction._id,
    status: "pending",
  });
  return lesson;
};

export default {
  claimLesson,
};
