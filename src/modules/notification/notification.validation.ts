import Joi from "joi";

const getNotification = {
  query: Joi.object().keys({
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    sort: Joi.string().default("createdAt desc"),
    populate: Joi.string(),
  }),
};

const deleteNotification = {
  params: Joi.object().keys({
    notificationId: Joi.string().required(),
  }),
};

export default {
  getNotification,
  deleteNotification,
};
