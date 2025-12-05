import Joi from "joi";

const updateProfile = {
  body: Joi.object({
    name: Joi.string().trim().allow(null).optional(),
    email: Joi.string().email().lowercase().trim().optional(),
    avatar: Joi.string().optional(),
    fcmToken: Joi.string().allow(null).optional(),
    dateOfBirth: Joi.date().allow(null).optional(),
    phoneNumber: Joi.number().allow(null).optional(),
    countryCode: Joi.string().allow(null).optional(),
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
      hourlyRate: Joi.number().allow(null).optional(),
      availableTime: Joi.object({
        startTime: Joi.string().allow(null).optional(),
        endTime: Joi.date().allow(null).optional(),
      }).optional(),
      availableDays: Joi.array().items(Joi.string()).allow(null).optional(),
      documents: Joi.array().items(Joi.string()).allow(null).optional(),
    }).optional(),
  }).min(1),
};

export default { updateProfile };
