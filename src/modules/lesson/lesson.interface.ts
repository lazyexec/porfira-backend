import { Model, Types } from "mongoose";

export interface ILesson {
  teacher: Types.ObjectId; // User ID
  student: Types.ObjectId; // User ID
  transaction: Types.ObjectId; // Transaction ID
  status: string;
  duration: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ILessonModel extends Model<ILesson> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
}
