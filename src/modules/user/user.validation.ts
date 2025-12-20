import Joi from "joi";
import validator from "../../utils/validator";

const updateProfile = {
  body: Joi.object({
    name: Joi.string().trim().optional(),
    avatar: Joi.string().optional(),
    fcmToken: Joi.string().allow(null).optional(),
    dateOfBirth: Joi.date().optional(),
    phoneNumber: Joi.number().optional(),
    countryCode: Joi.string().optional(),
    bio: Joi.string().allow(null).optional(),
    // ---------- STUDENT FIELDS ----------
    student: Joi.object({
      interestedSubjects: Joi.array()
        .items(Joi.string())
        .allow(null)
        .optional(),
    }).optional(),
    // ---------- TEACHER FIELDS ----------
    teacher: Joi.object({
      yearsOfTeachingExp: Joi.number().allow(null).optional(),
      subjectsTaught: Joi.array().items(Joi.string()).allow(null).optional(),
      hourlyRate: Joi.number().optional(),
      availableTime: Joi.object({
        startTime: Joi.date().optional(),
        endTime: Joi.date().optional(),
      }).optional(),
      availableDays: Joi.array().items(Joi.string()).optional(),
      documents: Joi.array().items(Joi.string()).optional(),
      content: Joi.string().allow(null).optional(),
      qualification: Joi.array().items(Joi.object()).optional(),
    }).optional(),
  }),
};

const queryAllUsers = {
  query: Joi.object().keys({
    page: Joi.number().default(1),
    limit: Joi.number().default(10),
    sort: Joi.string().default("createdAt desc"),
    role: Joi.string(),
    isDeleted: Joi.boolean(),
    email: Joi.string().email(),
    name: Joi.string(),
    phoneNumber: Joi.number(),
  }),
};

const restrictUser = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
  body: Joi.object({
    reason: Joi.string().required(),
  }),
};

const unrestrictUser = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
};

const getUserById = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
  }),
};

const addUser = {
  body: Joi.object({
    avatar: Joi.string().optional(),
    name: Joi.string().required(),
    email: Joi.string().required(),
    role: Joi.string().required(),
    dateOfBirth: Joi.string().isoDate().optional(),
    password: Joi.custom(validator.password).required(),
  }),
};

export default {
  updateProfile,
  queryAllUsers,
  restrictUser,
  unrestrictUser,
  getUserById,
  addUser,
};
