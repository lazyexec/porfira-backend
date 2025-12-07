import express from "express";
import reviewController from "./review.controller.ts";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import reviewValidation from "./review.validation.ts";

const router = express.Router();

router
  .route("/")
  .post(
    auth("student"),
    validate(reviewValidation.create),
    reviewController.createReview
  );

router
  .route("/:reviewId")
  .patch(
    auth("student"),
    validate(reviewValidation.update),
    reviewController.updateReview
  )
  .delete(
    auth("common"),
    validate(reviewValidation.deleteReview),
    reviewController.deleteReview
  );

router
  .route("/user")
  .get(
    auth("common"),
    validate(reviewValidation.getReviews),
    reviewController.getReviews
  );

// Special Route for admin
router
  .route("/admin")
  .get(
    auth("admin"),
    validate(reviewValidation.queryReview),
    reviewController.queryReview
  );

export default router;
