import catchAsync from "../../utils/catchAsync";
import type { Request, Response } from "express";
import httpStatus from "http-status";
import response from "../../configs/response";
import transactionService from "./transaction.service";
import pick from "../../utils/pick";

const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
  const filter = pick(req.query, []);
  const options = pick(req.query, ["sort", "limit", "page"]);
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

const getTransaction = catchAsync(async (req: Request, res: Response) => {
  const { transactionId } = req.params;
  const transaction = await transactionService.getTransaction(transactionId!);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Transaction retrieved successfully",
      data: transaction,
    })
  );
});

const getTeacherWalletDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const wallet = await transactionService.getTeacherWalletDashboard(
      teacherId!
    );
    res.status(httpStatus.OK).json(
      response({
        status: httpStatus.OK,
        message: "Teacher wallet retrieved successfully",
        data: wallet,
      })
    );
  }
);

const getStudentWalletDashboard = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const wallet = await transactionService.getStudentWalletDashboard(
      studentId!
    );
    res.status(httpStatus.OK).json(
      response({
        status: httpStatus.OK,
        message: "Student wallet retrieved successfully",
        data: wallet,
      })
    );
  }
);

const getTeacherTransactions = catchAsync(
  async (req: Request, res: Response) => {
    const teacherId = req.user?.id;
    const filter = pick(req.query, ["status"]);
    const options = pick(req.query, ["sort", "limit", "page"]);
    const transactions = await transactionService.getTeacherTransactions(
      teacherId!,
      filter,
      options
    );
    res.status(httpStatus.OK).json(
      response({
        status: httpStatus.OK,
        message: "Teacher transactions retrieved successfully",
        data: transactions,
      })
    );
  }
);

const getStudentTransactions = catchAsync(
  async (req: Request, res: Response) => {
    const studentId = req.user?.id;
    const filter = pick(req.query, ["status"]);
    const options = pick(req.query, ["sort", "limit", "page"]);
    const transactions = await transactionService.getStudentTransactions(
      studentId!,
      filter,
      options
    );
    res.status(httpStatus.OK).json(
      response({
        status: httpStatus.OK,
        message: "Student transactions retrieved successfully",
        data: transactions,
      })
    );
  }
);

export default {
  getAllTransactions,
  getTransaction,
  getTeacherWalletDashboard,
  getStudentWalletDashboard,
  getTeacherTransactions,
  getStudentTransactions,
};
