import Joi from "joi";

const getAllTransactions = {
  query: Joi.object().keys({
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().default("createdAt desc"),
  }),
};

export default {
  getAllTransactions,
};
