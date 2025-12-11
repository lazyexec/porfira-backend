import * as admin from "firebase-admin";
import "../../configs/firebase";
import ApiError from "../../utils/ApiError";
import logger from "../../utils/logger";
import httpStatus from "http-status";
import Notification from "./notification.model";
import User from "../user/user.model";

/**
 * Sends a push notification to one or more FCM tokens.
 *
 * @param targetTokens A single FCM registration token or an array of tokens.
 * @param notificationPayload The notification title and body.
 * @param dataPayload Optional custom data fields.
 */
const pushNotification = async (
  targetTokens: string | string[],
  notificationPayload: { title: string; body: string },
  dataPayload?: Record<string, string>
): Promise<admin.messaging.BatchResponse | string | void> => {
  // Determine if sending to a single token or multiple tokens
  const isMulticast = Array.isArray(targetTokens) && targetTokens.length > 1;

  // Use multicast if sending to multiple tokens, otherwise use send() for a single token
  try {
    if (isMulticast) {
      const multicastMessage: admin.messaging.MulticastMessage = {
        notification: {
          title: notificationPayload.title,
          body: notificationPayload.body,
        },
        ...(dataPayload && { data: dataPayload }),
        tokens: targetTokens as string[],
      };
      const response = await admin
        .messaging()
        .sendEachForMulticast(multicastMessage);
      console.log(
        `Successfully sent ${response.successCount} messages, ${response.failureCount} failed.`
      );
      return response;
    } else if (Array.isArray(targetTokens) && targetTokens.length === 1) {
      // Handle the single-element array case for simplicity with send()
      const message: admin.messaging.Message = {
        notification: {
          title: notificationPayload.title,
          body: notificationPayload.body,
        },
        ...(dataPayload && { data: dataPayload }),
        token: targetTokens[0]!,
      };
      const response = await admin.messaging().send(message);
      console.log("Successfully sent message:", response);
      return response;
    } else if (typeof targetTokens === "string") {
      // Handle single string token
      const message: admin.messaging.Message = {
        notification: {
          title: notificationPayload.title,
          body: notificationPayload.body,
        },
        ...(dataPayload && { data: dataPayload }),
        token: targetTokens,
      };
      const response = await admin.messaging().send(message);
      logger.success("Successfully sent message:", response);
      return response;
    }
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const createNotification = async (
  user: string,
  title: string,
  description: string
): Promise<void> => {
  try {
    const notification = new Notification({
      user,
      title,
      description,
    });
    const receiverToken = await User.findOne({ _id: user }).select("fcmToken");
    if (receiverToken?.fcmToken) {
      await pushNotification(receiverToken.fcmToken, {
        title,
        body: description,
      });
    }
    await notification.save();
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const deleteNotification = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  try {
    await Notification.deleteOne({ _id: notificationId, user: userId });
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const getAllNotifications = async (
  userId: string,
  options: any
): Promise<any> => {
  try {
    const notifications = await Notification.paginate(
      { user: userId },
      options
    );
    return notifications;
  } catch (error: any) {
    throw new ApiError(httpStatus.BAD_REQUEST, error.message);
  }
};

const clearAllNotification = async (userId: string) => {
  return await Notification.deleteMany({ user: userId });
};

const lessonConfirmationNotification = async (
  student: string,
  teacher: string
) => {
  await createNotification(
    student,
    "Lesson Confirmation",
    "Your lesson has been confirmed"
  );
  await createNotification(
    teacher,
    "Lesson Confirmation",
    "Your lesson has been confirmed"
  );
};

export default {
  pushNotification,
  createNotification,
  deleteNotification,
  getAllNotifications,
  clearAllNotification,
  lessonConfirmationNotification,
};
