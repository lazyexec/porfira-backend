import express from "express";
import reviewController from "./booking.controller.ts";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import bookingValidation from "./booking.validation.ts";

const router = express.Router();

router.post(
  "/claim",
  auth("student"),
  validate(bookingValidation.claimBooking),
  reviewController.claimBooking
);

router.post(
  "/:bookingId/payment",
  auth("student"),
  validate(bookingValidation.rePayment),
  reviewController.rePayment
);

export default router;
