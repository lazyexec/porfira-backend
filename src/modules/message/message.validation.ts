import Joi from "joi";
import validator from "../../utils/validator.ts";

const createConversation = {
  params: Joi.object({
    targetId: Joi.custom(validator.objectId).required(),
  }),
};

const sendMessage = {
  params: Joi.object({
    conversationId: Joi.custom(validator.objectId).required(),
  }),
};

const getMessages = {
  params: Joi.object({
    conversationId: Joi.custom(validator.objectId).required(),
  }),
  query: Joi.object({
    search: Joi.string().optional(),
    page: Joi.number().optional(),
    limit: Joi.number().optional(),
    sort: Joi.string().optional().default("createdAt -1"),
  }),
};

export default {
  createConversation,
  sendMessage,
  getMessages,
};
