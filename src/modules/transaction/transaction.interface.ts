import { Model, Types } from "mongoose";

export interface ITransaction {
  performedBy?: Types.ObjectId | string; // teacher or system
  receivedBy?: Types.ObjectId | string; // student
  transactionId?: string; // from Stripe/PayPal
  amount?: number;
  platformFee?: number;
  teacherEarnings?: number;
  type?: string;
  priceId?: string;
  method?: string;
  status?: string;
  description?: string | null;
  meta?: Object | null;
}

export interface ITransactionModel extends Model<ITransaction> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
}
