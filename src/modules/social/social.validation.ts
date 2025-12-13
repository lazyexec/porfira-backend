import Joi from "joi";

const queryTeachers = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().optional().default("teacher.rating desc"),
    name: Joi.string().optional(),
    subject: Joi.string().optional(),
    language: Joi.string().optional(),
    minExperience: Joi.number().optional(),
    maxExperience: Joi.number().optional(),
    rating: Joi.number().optional(),
    minPrice: Joi.number().optional(),
    maxPrice: Joi.number().optional(),
  }),
};

const queryStudents = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().optional(),
    name: Joi.string().optional(),
    subject: Joi.string().optional(),
    language: Joi.string().optional(),
  }),
};

export default {
  queryTeachers,
  queryStudents,
};
