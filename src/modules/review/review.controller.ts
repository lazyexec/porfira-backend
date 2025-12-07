import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import reviewService from "./review.service.ts";
import pick from "../../utils/pick.ts";

// creates a review (Student)
const createReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { toUser, score, comment } = req.body;
  const review = await reviewService.createReview({
    fromUser: userId,
    toUser,
    score,
    comment,
  });

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Review created successfully",
      data: review,
    })
  );
});

// Update or Modify a review (Student)
const updateReview = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const reviewId = req.params.reviewId;
  const { score, comment } = req.body;
  const review = await reviewService.updateReview(
    reviewId || "",
    userId || "",
    {
      score,
      comment,
    }
  );

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Review updated successfully",
      data: review,
    })
  );
});

// Get Reviews by Teacher ID
const getReviews = catchAsync(async (req: Request, res: Response) => {
  let teacherId: string | undefined;
  if (req.user?.role === "teacher") {
    teacherId = req.user?.id;
  } else {
    teacherId = req.body.teacherId;
  }
  const options = pick(req.query, ["page", "limit", "sort"]);
  const review = await reviewService.queryReview(
    { toUser: teacherId },
    options
  );
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Review fetched successfully",
      data: review,
    })
  );
});

// Delete a review (Student, Teacher and Admin)
const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const reviewId = req.params.reviewId;
  if (!reviewId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Review ID is required");
  }
  await reviewService.deleteReview(reviewId);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Review deleted successfully",
    })
  );
});

// Query reviews (Admin)
const queryReview = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, [
    "page",
    "limit",
    "sort",
    "fromUser",
    "toUser",
  ]);
  const review = await reviewService.queryReview({}, options);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Review fetched successfully",
      data: review,
    })
  );
});

export default {
  createReview,
  getReviews,
  updateReview,
  deleteReview,
  queryReview,
};
