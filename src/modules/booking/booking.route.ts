import express from "express";
import bookingController from "./booking.controller";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import bookingValidation from "./booking.validation";

const router = express.Router();

router.post(
  "/claim",
  auth("student"),
  validate(bookingValidation.claimBooking),
  bookingController.claimBooking
);

router.post(
  "/:bookingId/payment",
  auth("student"),
  validate(bookingValidation.rePayment),
  bookingController.rePayment
);

router.get(
  "/student",
  auth("student"),
  validate(bookingValidation.getStudentBookings),
  bookingController.getStudentBookings
);

router.get(
  "/teacher",
  auth("teacher"),
  validate(bookingValidation.getTeacherBookings),
  bookingController.getTeacherBookings
);

router.post(
  "/:bookingId/complete",
  auth("admin"),
  validate(bookingValidation.completeBookingState),
  bookingController.completeBookingState
);

router.post(
  "/:bookingId/cancel",
  auth("common"),
  validate(bookingValidation.cancelBooking),
  bookingController.cancelBooking
);

router.post(
  "/:bookingId/reschedule",
  auth("common"),
  validate(bookingValidation.rescheduleBooking),
  bookingController.rescheduleBooking
);

router.get(
  "/:bookingId",
  auth("common"),
  validate(bookingValidation.getBooking),
  bookingController.getBooking
);

// Admin Routes
router.get(
  "/",
  auth("admin"),
  validate(bookingValidation.getBookings),
  bookingController.getBookings
);

export default router;
