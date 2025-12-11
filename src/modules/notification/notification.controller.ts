import catchAsync from "../../utils/catchAsync";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import response from "../../configs/response";
import notificationService from "./notification.service";
import ApiError from "../../utils/ApiError";
import pick from "../../utils/pick";

const createNotification = catchAsync(async (req: Request, res: Response) => {
  const notification = await notificationService.createNotification(
    "",
    "",
    "",
    ""
  );
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Notification Created Successfully",
      data: notification,
    })
  );
});

const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  if (!notificationId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Notification ID is required");
  }
  await notificationService.deleteNotification(req.user?.id!, notificationId);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Notification Deleted Successfully",
      data: {},
    })
  );
});

const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["sort", "limit", "page", "populate"]);
  const userId = req.user?.id!;
  const notifications = await notificationService.getAllNotifications(
    userId,
    options
  );
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Notifications Retrieved Successfully",
      data: notifications,
    })
  );
});

export default {
  createNotification,
  deleteNotification,
  getAllNotifications,
};
