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

const getTeacherBookings = catchAsync(async (req: Request, res: Response) => {
  const teacherId = req.user?.id;
  if (!teacherId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }
  const options = pick(req.query, [
    "sort",
    "limit",
    "page",
    "populate",
    "status",
  ]);
  const booking = await bookingService.getBookingsTeacher(teacherId, options);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Booking Teacher Retrieved Successfully",
      data: booking,
    })
  );
});

const getStudentBookings = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.user?.id;
  if (!studentId) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "User not authenticated");
  }
  const options = pick(req.query, [
    "sort",
    "limit",
    "page",
    "populate",
    "status",
  ]);
  const booking = await bookingService.getStudentBookings(studentId, options);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Booking Student Retrieved Successfully",
      data: booking,
    })
  );
});

const getBookings = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, [
    "sort",
    "limit",
    "page",
    "populate",
    "status",
  ]);
  const booking = await bookingService.getBookings(options);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Booking Retrieved Successfully",
      data: booking,
    })
  );
});

const updateBooking = catchAsync(async (req: Request, res: Response) => {});

const deleteBooking = catchAsync(async (req: Request, res: Response) => {});

export default {
  claimBooking,
  getTeacherBookings,
  getStudentBookings,
  getBookings,
  updateBooking,
  deleteBooking,
  rePayment,
};
