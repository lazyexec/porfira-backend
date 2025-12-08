import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import userService from "./user.service.ts";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import stripeService from "../stripe/stripe.service.ts";

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
  const file = req.file;
  if (file) {
    req.body.avatar = file.path;
  }
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");
  }
  const user = await userService.updateUser(userId, req.body);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "User profile Updated successfully",
      data: user,
    })
  );
});

export default { getProfile, updateProfile };
