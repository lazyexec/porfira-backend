import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import Transaction from "./transaction.model.ts";

const getTransactions = async (filter: any, options: any) => {
  const transactions = await Transaction.find();
  return transactions;
};

const getTeacherEarnings = async (teacherId: string) => {
  const earnings = await Transaction.aggregate([
    { $match: { teacherId: teacherId, status: "completed" } },
    { $group: { _id: null, totalEarnings: { $sum: "$amount" } } },
  ]);
  return earnings[0]?.totalEarnings || 0;
};

const getSystemRevenues = async () => {
  const revenues = await Transaction.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, totalRevenues: { $sum: "$systemFee" } } },
  ]);
  return revenues[0]?.totalRevenues || 0;
};

const createTransaction = async (transactionData: object) => {
  const transaction = new Transaction(transactionData);
  await transaction.save();
  return transaction;
};

export default {
  getTransactions,
  getTeacherEarnings,
  getSystemRevenues,
  createTransaction,
};
