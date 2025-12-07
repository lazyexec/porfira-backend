import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import pick from "../../utils/pick.ts";
import bookingService from "./booking.service.ts";
import stripe from "../../configs/stripe.ts";

const claimBooking = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }
  const { teacherId, duration, date, time, subject } = req.body;

  const claim = await bookingService.claimBooking(
    userId,
    teacherId,
    duration,
    date,
    time,
    subject
  );
  if (claim.url) {
    res.status(httpStatus.OK).json(claim.url);
  } else {
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json(
      response({
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Failed to Proceed the Payment",
        data: {},
      })
    );
  }
});

const confirmBooking = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers["stripe-signature"] as string;
  if (!signature) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Payment Signature is Invalid");
  }
  const verify = stripe.verifyWebhook(req, signature);
  const booking = await bookingService.confirmSession(verify);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Booking Created Successfully",
      data: booking,
    })
  );
});

const rePayment = catchAsync(async (req: Request, res: Response) => {
  const bookingId = req.params.bookingId;
  if (!bookingId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Booking ID is required");
  }
  const booking = await bookingService.rePayment(bookingId);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Booking Re-Payment Created Successfully",
      data: booking,
    })
  );
});

const getBooking = catchAsync(async (req: Request, res: Response) => {});

const updateBooking = catchAsync(async (req: Request, res: Response) => {});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {});

export default {
  claimBooking,
  getBooking,
  updateBooking,
  deleteBooking,
  confirmBooking,
  rePayment,
};
