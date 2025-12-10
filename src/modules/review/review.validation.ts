import Joi from "joi";
import validator from "../../utils/validator";

const create = {
  body: Joi.object().keys({
    toUser: Joi.custom(validator.objectId).required().label("To User"),
    score: Joi.number().required().label("Score"),
    comment: Joi.string().required().label("Comment"),
  }),
};

const update = {
  params: Joi.object().keys({
    reviewId: Joi.custom(validator.objectId).required().label("Review ID"),
  }),
  body: Joi.object().keys({
    score: Joi.number().required(),
    comment: Joi.string().required(),
  }),
};

const deleteReview = {
  params: Joi.object().keys({
    reviewId: Joi.custom(validator.objectId).required().label("Review ID"),
  }),
};

const getReviews = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().optional(),
  }),
  body: Joi.object().keys({
    teacherId: Joi.custom(validator.objectId).optional(),
  }),
};

const queryReview = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().optional(),
  }),
  body: Joi.object().keys({
    fromUser: Joi.custom(validator.objectId).optional(),
    toUser: Joi.custom(validator.objectId).optional(),
  }),
};

export default {
  create,
  update,
  deleteReview,
  getReviews,
  queryReview,
};
