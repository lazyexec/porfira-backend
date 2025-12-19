import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import Transaction from "./transaction.model";
import { Types } from "mongoose";
import type { ITransaction } from "./transaction.interface";
import stripe from "../../configs/stripe";
import userService from "../user/user.service";

const getTransactions = async (filter: any, options: any) => {
  const transactions = await Transaction.paginate(filter, options);
  return transactions;
};

const getTeacherEarnings = async (teacherId: string) => {
  const earnings = await Transaction.aggregate([
    {
      $match: {
        receivedBy: new Types.ObjectId(teacherId),
        status: "completed",
      },
    },
    { $group: { _id: null, totalEarnings: { $sum: "$teacherEarnings" } } },
  ]);
  return earnings[0]?.totalEarnings || 0;
};

const getSystemRevenues = async () => {
  const revenues = await Transaction.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, totalRevenues: { $sum: "$platformFee" } } },
  ]);
  return revenues[0]?.totalRevenues || 0;
};

const createTransaction = async (transactionData: ITransaction) => {
  const transaction = await Transaction.create(transactionData);
  return transaction;
};

const getAllTransactions = async (filter: any, options: any) => {
  const transactions = await Transaction.paginate(filter, options);
  return transactions;
};

const createOnBoardingIntent = async (teacherStripeAccountId: string) => {
  const intent = await stripe.createOnboardingLink(teacherStripeAccountId);
  return intent;
};

const getTransaction = async (transactionId: string) => {
  const transaction = await Transaction.findById(transactionId).populate([
    {
      path: "performedBy",
      select: "name email",
    },
    {
      path: "receivedBy",
      select: "name email",
    },
  ]);
  return transaction;
};

const getStudentWalletDashboard = async (studentId: string) => {
  const studentObjectId = new Types.ObjectId(studentId);

  const pendingPaymentsCountPromise = Transaction.aggregate([
    { $match: { performedBy: studentObjectId, status: "pending" } },
    { $count: "pendingCount" },
  ]);

  const totalSpentPromise = Transaction.aggregate([
    { $match: { performedBy: studentObjectId, status: "completed" } },
    { $group: { _id: null, totalSpent: { $sum: "$amount" } } },
  ]);

  const completedPaymentsPromise = Transaction.aggregate([
    { $match: { performedBy: studentObjectId, status: "completed" } },
    { $group: { _id: null, completedPayments: { $sum: "$amount" } } },
  ]);

  const lastTransactionsPromise = Transaction.find({
    performedBy: studentObjectId,
  })
    .sort({ createdAt: -1 })
    .limit(5);

  const [pending, spent, completed, lastTransactions] = await Promise.all([
    pendingPaymentsCountPromise,
    totalSpentPromise,
    completedPaymentsPromise,
    lastTransactionsPromise,
  ]);

  return {
    totalPendingPayments: pending[0]?.pendingCount || 0,
    totalSpent: spent[0]?.totalSpent || 0,
    completedPayments: completed[0]?.completedPayments || 0,
    lastTransactions,
  };
};

const getTeacherWalletDashboard = async (teacherId: string) => {
  const teacherObjectId = new Types.ObjectId(teacherId);

  const pendingPaymentsCountPromise = Transaction.aggregate([
    { $match: { receivedBy: teacherObjectId, status: "pending" } },
    { $count: "pendingCount" },
  ]);

  const totalEarningsPromise = Transaction.aggregate([
    { $match: { receivedBy: teacherObjectId, status: "completed" } },
    { $group: { _id: null, totalEarnings: { $sum: "$teacherEarnings" } } },
  ]);

  const lastTransactionsPromise = Transaction.find({
    receivedBy: teacherObjectId,
  })
    .sort({ createdAt: -1 })
    .limit(5);

  const totalEarningsCurrentMonthPromise = Transaction.aggregate([
    {
      $match: {
        receivedBy: teacherObjectId,
        status: "completed",
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    },
    {
      $group: {
        _id: null,
        totalEarningsCurrentMonth: { $sum: "$teacherEarnings" },
      },
    },
  ]);

  const [pending, totalEarnings, lastTransactions, totalEarningsCurrentMonth] =
    await Promise.all([
      pendingPaymentsCountPromise,
      totalEarningsPromise,
      lastTransactionsPromise,
      totalEarningsCurrentMonthPromise,
    ]);

  return {
    totalPendingPayments: pending[0]?.pendingCount || 0,
    totalEarnings: totalEarnings[0]?.totalEarnings || 0,
    totalEarningsCurrentMonth:
      totalEarningsCurrentMonth[0]?.totalEarningsCurrentMonth || 0,
    lastTransactions,
  };
};

const getTeacherTransactions = async (
  teacherId: string,
  filter: any,
  options: any
) => {
  return await Transaction.paginate(
    { receivedBy: teacherId, ...filter },
    options
  );
};

const getStudentTransactions = async (
  studentId: string,
  filter: any,
  options: any
) => {
  return await Transaction.paginate(
    { performedBy: studentId, ...filter },
    options
  );
};

const deleteTransaction = async (transactionId: string) => {
  await Transaction.findByIdAndDelete(transactionId);
};

export default {
  getTransactions,
  getTeacherEarnings,
  getSystemRevenues,
  createTransaction,
  getAllTransactions,
  getTransaction,
  getTeacherWalletDashboard,
  getStudentWalletDashboard,
  getTeacherTransactions,
  getStudentTransactions,
  // Account completion
  createOnBoardingIntent,
  deleteTransaction,
};
