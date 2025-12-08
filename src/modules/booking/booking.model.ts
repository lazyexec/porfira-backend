import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import hideFields from "../../plugins/mongoose/hideFields.plugin.ts";
import type { IBooking, IBookingModel } from "./booking.interface.ts";

const bookingSchema = new mongoose.Schema<IBooking>(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "transaction",
      required: true,
    },
    fromTime: {
      type: Date,
      required: true,
    },
    toTime: {
      type: Date,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["unpaid", "pending", "rejected", "completed", "scheduled", "cancelled"],
      default: "unpaid",
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.plugin(mongoosePaginate);
bookingSchema.plugin(hideFields);

const Booking = mongoose.model<IBooking, IBookingModel>(
  "Booking",
  bookingSchema
);

export default Booking;
