import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import notificationService from "./notification.service.ts";
import ApiError from "../../utils/ApiError.ts";
import pick from "../../utils/pick.ts";

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
  await notificationService.deleteNotification(req.user!.id, notificationId);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Notification Deleted Successfully",
      data: {},
    })
  );
});

const getAllNotifications = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["sortBy", "limit", "page", "populate"]);
  const userId = req.user!.id;
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
