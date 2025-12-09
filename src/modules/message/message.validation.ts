import Joi from "joi";

const createConversation = {
    params: Joi.object({
        targetId: Joi.string().required(),
    })
}

const sendMessage = {
    params: Joi.object({
        conversationId: Joi.string().required(),
    })
}

const getMessages = {
    params: Joi.object({
        conversationId: Joi.string().required(),
    })
}

export default {
    createConversation,
    sendMessage,
    getMessages
}