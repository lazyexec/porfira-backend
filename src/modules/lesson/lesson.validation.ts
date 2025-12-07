import Joi from "joi";

const claimLesson = {
  body: Joi.object().keys({
    teacherId: Joi.string().required(),
    duration: Joi.number().min(1).required(),
  }),
};

export default {
  claimLesson,
};
