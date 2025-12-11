import mongoose from "mongoose";
import type {
  INotification,
  INotificationModel,
} from "./notification.interface";
import mongoosePaginate from "mongoose-paginate-v2";
import hideFields from "../../plugins/mongoose/hideFields.plugin";

const notificationSchema = new mongoose.Schema<INotification>(
  {
    user: mongoose.Types.ObjectId,
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
