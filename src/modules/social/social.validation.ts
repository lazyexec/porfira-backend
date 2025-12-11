import Joi from "joi";

const queryTeachers = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().optional(),
  }),
};

const queryStudents = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().optional(),
  }),
};

export default {
  queryTeachers,
  queryStudents,
};
