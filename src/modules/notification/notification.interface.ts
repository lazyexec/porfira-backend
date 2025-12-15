import { Model, Types } from "mongoose";

export interface INotification {
  user: Types.ObjectId | string | null;
  title: string;
  description: string;
  transactionId: string | null;
  type: "personal" | "admin" | "global";
}

export interface INotificationModel extends Model<INotification> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
}
