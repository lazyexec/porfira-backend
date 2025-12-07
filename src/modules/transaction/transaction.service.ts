import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import Transaction from "./transaction.model.ts";
import type { ITransaction } from "./transaction.interface.ts";

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

const createTransaction = async (transactionData: ITransaction) => {
  const transaction = await Transaction.create(transactionData);
  return transaction;
};

const getAllTransactions = async (filter: any, options: any) => {
  const transactions = await Transaction.paginate(filter, options);
  return transactions;
};

export default {
  getTransactions,
  getTeacherEarnings,
  getSystemRevenues,
  createTransaction,
  getAllTransactions,
};
