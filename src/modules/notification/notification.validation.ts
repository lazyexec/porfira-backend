import Joi from "joi";
import validator from "../../utils/validator";

const getNotification = {
  query: Joi.object().keys({
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    sort: Joi.string().default("createdAt desc"),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.custom(validator.objectId).required(),
  }),
};

export default {
  getNotification,
  deleteNotification,
};
