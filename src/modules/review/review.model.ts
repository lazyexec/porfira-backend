import mongoose from "mongoose";
import type { IReview, IReviewModel } from "./review.interface";
import mongoosePaginate from "mongoose-paginate-v2";
import hideFields from "../../plugins/mongoose/hideFields.plugin";

const reviewSchema = new mongoose.Schema(
  {
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    toUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.plugin(mongoosePaginate);
reviewSchema.plugin(hideFields);

const Review = mongoose.model<IReview, IReviewModel>("Review", reviewSchema);

export default Review;
