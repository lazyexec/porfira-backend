import { Model, Types } from "mongoose";

export interface INotification {
  user: Types.ObjectId | string;
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
