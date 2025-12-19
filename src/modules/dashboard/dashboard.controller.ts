import catchAsync from "../../utils/catchAsync";
import type { Request, Response } from "express";
import { dashboardService } from "./dashboard.service";
import httpStatus from "http-status";
import response from "../../configs/response";

const getDashboard = catchAsync(async (req: Request, res: Response) => {
  const role = req.user?.role;
  let stats;
  if (role === "student") {
    stats = await dashboardService.getStudentStats(req.user?.id as string);
  }
  if (role === "teacher") {
    stats = await dashboardService.getTeacherStats(req.user?.id as string);
  }
  if (role === "admin") {
    stats = await dashboardService.getAdminStats();
  }
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: `${role} dashboard stats retrieved successfully`,
      data: stats,
    })
  );
});

export default {
  getDashboard,
};
