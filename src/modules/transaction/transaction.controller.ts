import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import transactionService from "./transaction.service.ts";


const getAllTransactions = catchAsync(async (req: Request, res: Response) => {
    const transactions = await transactionService.getAllTransactions();
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
