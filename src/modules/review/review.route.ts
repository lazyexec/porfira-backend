import express from "express";
import reviewController from "./review.controller";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import reviewValidation from "./review.validation";

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
