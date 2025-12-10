import Joi from "joi";
import validator from "../../utils/validator.ts";

const claimBooking = {
  body: Joi.object().keys({
    teacherId: Joi.custom(validator.objectId).required(),
    duration: Joi.number().min(1).required(),
    date: Joi.date().required(),
    time: Joi.date().required(),
    subject: Joi.string().required(),
  }),
};

const rePayment = {
  body: Joi.object().keys({
    bookingId: Joi.custom(validator.objectId).required(),
  }),
};

const getTeacherBookings = {
  query: Joi.object().keys({
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    sort: Joi.string().default("createdAt desc"),
    populate: Joi.string().default("student name avatar"),
    status: Joi.string().valid("pending", "completed", "scheduled"),
  }),
};

const getStudentBookings = {
  query: Joi.object().keys({
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    sort: Joi.string().default("createdAt desc"),
    populate: Joi.string().default("teacher name avatar"),
    status: Joi.string().valid("unpaid", "pending", "completed", "scheduled"),
  }),
};

const getBookings = {
  query: Joi.object().keys({
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    sort: Joi.string().default("createdAt desc"),
    populate: Joi.string().default("teacher,student,transaction"),
    status: Joi.string().valid(
      "unpaid",
      "pending",
      "completed",
      "scheduled",
      "rejected",
      "cancelled"
    ),
  }),
};
export default {
  claimBooking,
  rePayment,
  getTeacherBookings,
  getStudentBookings,
  getBookings,
};
