import Joi from "joi";

const createTicket = {
    body: Joi.object().keys({
        subject: Joi.string().required().min(3).max(200),
        priority: Joi.string().valid("low", "medium", "high").default("medium"),
        initialMessage: Joi.string().required().min(1),
    }),
};

const getTickets = {
    query: Joi.object().keys({
        status: Joi.string().valid("open", "in-progress", "resolved", "closed"),
        priority: Joi.string().valid("low", "medium", "high"),
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

const getTicket = {
    params: Joi.object().keys({
        ticketId: Joi.string().required(),
    }),
};

const updateTicketStatus = {
    params: Joi.object().keys({
        ticketId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        status: Joi.string()
            .valid("open", "in-progress", "resolved", "closed")
            .required(),
    }),
};

const sendMessage = {
    params: Joi.object().keys({
        ticketId: Joi.string().required(),
    }),
    body: Joi.object().keys({
        content: Joi.string().required().min(1),
    }),
};

const getMessages = {
    params: Joi.object().keys({
        ticketId: Joi.string().required(),
    }),
    query: Joi.object().keys({
        sortBy: Joi.string(),
        limit: Joi.number().integer(),
        page: Joi.number().integer(),
    }),
};

export default {
    createTicket,
    getTickets,
    getTicket,
    updateTicketStatus,
    sendMessage,
    getMessages,
};
