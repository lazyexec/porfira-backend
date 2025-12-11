import { Model, Types } from "mongoose";

export interface INotification {
  sender: Types.ObjectId | string;
  receiver: Types.ObjectId | string;
  title: string;
  description: string;
  transactionId: string | null;
}

export interface INotificationModel extends Model<INotification> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
}
