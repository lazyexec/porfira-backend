import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import Transaction from "./transaction.model.ts";
import { Types } from "mongoose";
import type { ITransaction } from "./transaction.interface.ts";
import stripe from "../../configs/stripe.ts";
import userService from "../user/user.service.ts";

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

export default {
  getTransactions,
  getTeacherEarnings,
  getSystemRevenues,
  createTransaction,
  getAllTransactions,
  // Account completion
  createOnBoardingIntent,
};
