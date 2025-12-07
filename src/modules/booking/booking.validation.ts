import Joi from "joi";

const claimBooking = {
  body: Joi.object().keys({
    teacherId: Joi.string().required(),
    duration: Joi.number().min(1).required(),
    date: Joi.date().required(),
    time: Joi.date().required(),
    subject: Joi.string().required(),
  }),
};

const rePayment = {
  body: Joi.object().keys({
    bookingId: Joi.string().required(),
  }),
};

export default {
  claimBooking,
  rePayment,
};
