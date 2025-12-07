import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import pick from "../../utils/pick.ts";
import lessonService from "./lesson.service.ts";

const claimLesson = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }
  const { teacherId, duration } = req.body;

  const claim = await lessonService.claimLesson(userId, teacherId, duration);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Review created successfully",
      data: claim,
    })
  );
});

const getLesson = catchAsync(async (req: Request, res: Response) => {});

const updateLesson = catchAsync(async (req: Request, res: Response) => {});

const deleteLesson = catchAsync(async (req: Request, res: Response) => {});

export default {
  claimLesson,
  getLesson,
  updateLesson,
  deleteLesson,
};
