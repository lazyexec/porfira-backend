import Joi from "joi";
import validator from "../../utils/validator";

const approveTeacher = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const rejectTeacher = {
  params: Joi.object().keys({
    id: Joi.custom(validator.objectId).required(),
  }),
};

const getPendingTeachers = {
  query: Joi.object().keys({
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAllBookings = {
  query: Joi.object().keys({
    status: Joi.string().valid(
      "pending",
      "confirmed",
      "cancelled",
      "completed"
    ),
    teacherId: Joi.string(),
    studentId: Joi.string(),
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAllTransactions = {
  query: Joi.object().keys({
    status: Joi.string().valid("pending", "completed", "failed"),
    teacherId: Joi.string(),
    studentId: Joi.string(),
    sort: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTeacherEarnings = {
  params: Joi.object().keys({
    id: Joi.custom(validator.objectId).required(),
  }),
};

export default {
  approveTeacher,
  rejectTeacher,
  getPendingTeachers,
  getAllBookings,
  getAllTransactions,
  getTeacherEarnings,
};
