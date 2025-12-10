import Joi from "joi";
import validator from "../../utils/validator.ts";

const getAllTransactions = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().default("createdAt desc"),
  }),
};

const getTransaction = {
  params: Joi.object().keys({
    transactionId: Joi.custom(validator.objectId).required(),
  }),
};

const getTeacherTransactions = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().default("createdAt desc"),
    status: Joi.string().optional(),
  }),
};

const getStudentTransactions = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().default("createdAt desc"),
    status: Joi.string().optional(),
  }),
};

export default {
  getAllTransactions,
  getTransaction,
  getTeacherTransactions,
  getStudentTransactions,
};
