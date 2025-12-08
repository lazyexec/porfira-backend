import express from "express";
import bookingController from "./booking.controller.ts";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import bookingValidation from "./booking.validation.ts";

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

// Admin Routes
router.get(
  "/",
  auth("admin"),
  validate(bookingValidation.getBookings),
  bookingController.getBookings
);

export default router;
