import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import Review from "./review.model.ts";

const createReview = async (reviewData: any) => {
  const review = await Review.create(reviewData);
  return review;
};

const getReview = async (reviewData: any) => {
  const review = await Review.findById(reviewData);
  return review;
};

const updateReview = async (
  reviewId: string,
  userId: string,
  reviewData: any
) => {
  const review = await Review.findOne({ _id: reviewId, fromUser: userId });
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }
  Object.assign(review, reviewData);
  await review.save();
  return review;
};

const deleteReview = async (reviewId: string) => {
  const review = await Review.findByIdAndDelete(reviewId);
  return review;
};

const queryReview = async (filter: object, options: object) => {
  const review = await Review.paginate(filter, {
    ...options,
    populate: "toUser name avatar,fromUser name avatar",
  });
  return review;
};

export default {
  createReview,
  getReview,
  updateReview,
  deleteReview,
  queryReview,
};
