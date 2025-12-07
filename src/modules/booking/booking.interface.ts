import { Model, Types } from "mongoose";

export interface IBooking {
  teacher: Types.ObjectId; // User ID
  student: Types.ObjectId; // User ID
  transaction: Types.ObjectId; // Transaction ID
  status: string;
  duration: number;
  fromTime: Date;
  toTime: Date;
  subject: string;
  date: Date;
}

export interface IBookingModel extends Model<IBooking> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
}
