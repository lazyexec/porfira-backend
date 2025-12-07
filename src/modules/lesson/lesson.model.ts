import mongoose from "mongoose";
import paginate from "../../plugins/mongoose/paginate.plugin.ts";
import hideFields from "../../plugins/mongoose/hideFields.plugin.ts";
import type { ILesson, ILessonModel } from "./lesson.interface.ts";

const lessonSchema = new mongoose.Schema<ILesson>(
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
    duration: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

lessonSchema.plugin(paginate);
lessonSchema.plugin(hideFields);

const Lesson = mongoose.model<ILesson, ILessonModel>("Lesson", lessonSchema);

export default Lesson;
