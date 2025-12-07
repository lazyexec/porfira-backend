import mongoose from "mongoose";
import paginate from "../../plugins/mongoose/paginate.plugin.ts";
import hideFields from "../../plugins/mongoose/hideFields.plugin.ts";
import type {
  ITransaction,
  ITransactionModel,
} from "./transaction.interface.ts";

const transactionSchema = new mongoose.Schema<ITransaction>(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    receivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    teacherEarnings: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      required: true,
    },
    type: {
      type: String,
      enum: ["payment", "refund", "transfer"],
      default: "payment",
      required: true,
    },
    description: {
      type: String,
      default: null,
      required: false,
    },
    meta: {
      type: Object,
      default: null,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.plugin(paginate);
transactionSchema.plugin(hideFields);

const Transaction = mongoose.model<ITransaction, ITransactionModel>(
  "Transaction",
  transactionSchema
);

export default Transaction;
