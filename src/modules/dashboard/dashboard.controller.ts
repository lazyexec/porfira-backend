import catchAsync from "../../utils/catchAsync";
import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";
import httpStatus from "http-status";
import response from "../../configs/response";

const getStudentDashboard = catchAsync(async (req: Request, res: Response) => {
  const stats = await dashboardService.getStudentStats(req.user?.id as string);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Student dashboard stats retrieved successfully",
      data: stats,
    })
  );
});

const getTeacherDashboard = catchAsync(async (req: Request, res: Response) => {
  const stats = await dashboardService.getTeacherStats(req.user?.id as string);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Teacher dashboard stats retrieved successfully",
      data: stats,
    })
  );
});

export const dashboardController = {
  getStudentDashboard,
  getTeacherDashboard,
};
