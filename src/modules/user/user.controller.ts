import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import userService from "./user.service.ts";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import stripeService from "../stripe/stripe.service.ts";
import pick from "../../utils/pick.ts";
import type multer from "multer";

const getProfile = catchAsync(async (req: Request, res: Response) => {
  console.log("Req User:", req.user);
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  const user = await userService.getUserById(userId);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "User profile retrieved successfully",
      data: user,
    })
  );
});

const updateProfile = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const files: any = req.files;
  const body = req.body;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  const user = await userService.updateUser(userId, body, files);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "User profile Updated successfully",
      data: user,
    })
  );
});

const queryAllUsers = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, [
    "role",
    "isDeleted",
    "email",
    "name",
    "phoneNumber",
  ]);
  const options = pick(req.query, ["page", "limit", "sort"]);
  console.log({ queries: req.query, options });
  const users = await userService.queryAllUsers(filter, options);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Users retrieved successfully",
      data: users,
    })
  );
});

const restrictUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params?.userId;
  const user = await userService.restrictUser(userId!, req.body.reason);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "User restricted successfully",
      data: user,
    })
  );
});

const unrestrictUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params?.userId;
  const user = await userService.unRestrictUser(userId!);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "User unrestricted successfully",
      data: user,
    })
  );
});

export default {
  getProfile,
  updateProfile,
  queryAllUsers,
  restrictUser,
  unrestrictUser,
};
