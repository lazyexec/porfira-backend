import mongoose from "mongoose";
import type {
  INotification,
  INotificationModel,
} from "./notification.interface.ts";
import mongoosePaginate from "mongoose-paginate-v2";
import hideFields from "../../plugins/mongoose/hideFields.plugin.ts";

const notificationSchema = new mongoose.Schema<INotification>(
  {
    sender: mongoose.Types.ObjectId,
    receiver: mongoose.Types.ObjectId,
    title: String,
    description: String,
    transactionId: String,
  },
  {
    timestamps: true,
  }
);

notificationSchema.plugin(mongoosePaginate);
notificationSchema.plugin(hideFields);

const Notification = mongoose.model<INotification, INotificationModel>(
  "Notification",
  notificationSchema
);

export default Notification;
