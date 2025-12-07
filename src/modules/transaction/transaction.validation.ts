import Joi from "joi";

const create = {
  body: Joi.object().keys({
    toUser: Joi.string().required().label("To User"),
    score: Joi.number().required().label("Score"),
    comment: Joi.string().required().label("Comment"),
  }),
};

const update = {
  params: Joi.object().keys({
    reviewId: Joi.string().required().label("Review ID"),
  }),
  body: Joi.object().keys({
    score: Joi.number().required(),
    comment: Joi.string().required(),
  }),
};

const deleteReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().required().label("Review ID"),
  }),
};

const getReviews = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().optional(),
  }),
  body: Joi.object().keys({
    teacherId: Joi.string().optional(),
  }),
};

const queryReview = {
  query: Joi.object().keys({
    page: Joi.number().required().label("Page"),
    limit: Joi.number().required().label("Limit"),
    sort: Joi.string().required().label("Sort"),
  }),
  body: Joi.object().keys({
    fromUser: Joi.string().optional(),
    toUser: Joi.string().optional(),
  }),
};

export default {
  create,
  update,
  deleteReview,
  getReviews,
  queryReview,
};
