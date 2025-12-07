import { Model, Types } from "mongoose";

export interface IReview {
  fromUser: Types.ObjectId; // User ID
  toUser: Types.ObjectId; // User ID
  score: number; // Rating score
  comment: string; // Optional comment
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewModel extends Model<IReview> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
}
