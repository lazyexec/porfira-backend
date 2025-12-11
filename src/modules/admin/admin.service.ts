import User from "../user/user.model";
import Transaction from "../transaction/transaction.model";
import transactionService from "../transaction/transaction.service";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import type { Types } from "mongoose";
import Lesson from "../booking/booking.model";
import stripe from "../../configs/stripe";

/**
 * Approve teacher application
 */
const approveTeacher = async (teacherId: Types.ObjectId) => {
  const teacher = await User.findOne({
    _id: teacherId,
    role: "teacher",
    isDeleted: false,
  });

  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  if (!teacher.teacher) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is not a teacher");
  }

  if (teacher.teacher.status === "approved") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Teacher is Already Accepted");
  }

  const hourlyRate = teacher.teacher?.hourlyRate;
  if (!hourlyRate) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Teacher Hourly Rate Not Set");
  }

  const product = await stripe.stripe.products.create({
    name: `Lesson with ${teacher.name}`,
  });

  const price = await stripe.stripe.prices.create({
    product: product.id,
    unit_amount: hourlyRate * 100,
    currency: "usd",
  });

  teacher.teacher.stripePriceId = price.id;
  teacher.teacher.status = "approved";
  await teacher.save();

  return teacher;
};

const rejectTeacher = async (teacherId: Types.ObjectId) => {
  const teacher = await User.findOne({
    _id: teacherId,
    role: "teacher",
    isDeleted: false,
  });

  if (!teacher) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  if (!teacher.teacher) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User is not a teacher");
  }

  teacher.teacher.status = "rejected";
  await teacher.save();

  return teacher;
};

const getPendingTeachers = async (options: Record<string, any>) => {
  const teachers = await User.paginate(
    {
      role: "teacher",
      "teacher.status": "pending",
      isDeleted: false,
    },
    {
      ...options,
      select: "name email avatar teacher createdAt",
    }
  );

  return teachers;
};

/**
 * Get all transactions (admin view)
 */
const getAllTransactions = async (
  filter: Record<string, any>,
  options: Record<string, any>
) => {
  return await transactionService.getTransactions(filter, options);
};

/**
 * Get teacher earnings details
 */
const getTeacherEarnings = async (teacherId: string) => {
  return await transactionService.getTeacherEarnings(teacherId);
};

/**
 * Get system revenue
 */
const getSystemRevenue = async () => {
  return await transactionService.getSystemRevenues();
};

export default {
  approveTeacher,
  rejectTeacher,
  getPendingTeachers,
  getAllTransactions,
  getTeacherEarnings,
  getSystemRevenue,
};
