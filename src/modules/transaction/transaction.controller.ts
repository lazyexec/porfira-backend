import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import transactionService from "./transaction.service.ts";
import pick from "../../utils/pick.ts";

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, ["studentId", "teacherId", "status"]);
  const options = pick(req.query, ["sortBy", "limit", "page", "populate"]);
  const transactions = await transactionService.getAllTransactions(
    filter,
    options
  );
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "All transactions retrieved successfully",
      data: transactions,
    })
  );
});

export default {
  getAllTransactions,
};
