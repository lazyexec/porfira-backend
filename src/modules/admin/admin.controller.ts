import catchAsync from "../../utils/catchAsync";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import response from "../../configs/response";
import pick from "../../utils/pick";
import adminService from "./admin.service";

const approveTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const teacher = await adminService.approveTeacher(id as any);

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Teacher approved successfully",
      data: teacher,
    })
  );
});

const rejectTeacher = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const teacher = await adminService.rejectTeacher(id as any);

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Teacher rejected successfully",
      data: teacher,
    })
  );
});

const getPendingTeachers = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["sort", "limit", "page"]);
  const teachers = await adminService.getPendingTeachers(options);

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Pending teachers retrieved successfully",
      data: teachers,
    })
  );
});

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["status", "teacherId", "studentId"]);
  const options = pick(req.query, ["sort", "limit", "page"]);
  const transactions = await adminService.getAllTransactions(filter, options);

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "All transactions retrieved successfully",
      data: transactions,
    })
  );
});

const getTeacherEarnings = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const earnings = await adminService.getTeacherEarnings(id as any);

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Teacher earnings retrieved successfully",
      data: earnings,
    })
  );
});

const getSystemRevenue = catchAsync(async (req: Request, res: Response) => {
  const revenue = await adminService.getSystemRevenue();

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "System revenue retrieved successfully",
      data: revenue,
    })
  );
});

export default {
  approveTeacher,
  rejectTeacher,
  getPendingTeachers,
  getAllTransactions,
  getTeacherEarnings,
  getSystemRevenue,
};
