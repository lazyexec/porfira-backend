import Joi from "joi";

const approveTeacher = {
  params: Joi.object().keys({
    id: Joi.string().required(),
  }),
};

const rejectTeacher = {
  params: Joi.object().keys({
    id: Joi.string().required(),
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
    id: Joi.string().required(),
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
