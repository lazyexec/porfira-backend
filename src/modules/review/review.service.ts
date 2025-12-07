import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import Review from "./review.model.ts";
import User from "../user/user.model.ts";

const updateRating = async (userId: string) => {
  const teacherId = userId; // Assuming userId passed is the teacher's ID
  const result = await Review.aggregate([
    {
      $match: { toUser: teacherId }, // Assuming 'toUser' field stores the ID of the user being reviewed (teacher)
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  const averageRating = result.length > 0 ? result[0].averageRating : 0;

  const user = await User.findById(teacherId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
  }

  if (!user.teacher) {
    user.teacher = {}; // Initialize teacher object if it doesn't exist
  }
  user.teacher.rating = averageRating;
  await user.save();

  return user;
};

const createReview = async (reviewData: any) => {
  const review = await Review.create(reviewData);
  updateRating(reviewData.toUser.toString());
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
  updateRating(reviewData.toUser.toString());
  return review;
};

const deleteReview = async (reviewId: string) => {
  const review = await Review.findOne({_id: reviewId});
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }
  if (!review.toUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
  }
  updateRating(review.toUser.toString());
  await review.deleteOne();
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
