import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import Review from "./review.model";
import User from "../user/user.model";
import mongoose from "mongoose";

const updateRating = async (teacherId: mongoose.Types.ObjectId) => {
  const result = await Review.aggregate([
    {
      $match: { toUser: new mongoose.Types.ObjectId(teacherId) }, // Assuming 'toUser' field stores the ID of the user being reviewed (teacher)
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$score" },
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
  const isExist = await Review.findOne({
    fromUser: reviewData.fromUser,
    toUser: reviewData.toUser,
  });

  if (isExist) {
    const review = await Review.findOneAndUpdate(
      { _id: isExist._id },
      reviewData,
      {
        new: true,
      }
    );
    await updateRating(reviewData.toUser);
    return review;
  } else {
    const review = await Review.create(reviewData);
    await updateRating(reviewData.toUser);
    return review;
  }
};

const getReview = async (reviewData: any) => {
  const review = await Review.findById(reviewData);
  return review;
};

const deleteReview = async (reviewId: string) => {
  const review = await Review.findOne({ _id: reviewId });
  if (!review) {
    throw new ApiError(httpStatus.NOT_FOUND, "Review not found");
  }
  if (!review.toUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Teacher not found");
  }
  await updateRating(review.toUser);
  await review.deleteOne();
  return review;
};

const queryReview = async (filter: object, options: object) => {
  console.log(filter, options);
  const review = await Review.paginate(filter, {
    ...options,
    populate: [
      { path: "fromUser", select: "name avatar" },
      { path: "toUser", select: "name avatar" },
    ],
  });
  return review;
};

export default {
  createReview,
  getReview,
  deleteReview,
  queryReview,
};
