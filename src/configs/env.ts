import { configDotenv } from "dotenv";
import Joi from "joi";

configDotenv();

const validator = Joi.object({
  PORT: Joi.number().default(3000),
  MONGO_URI: Joi.string().optional(),
  NODE_ENV: Joi.string()
    .required()
    .valid("development", "production")
    .default("development"),
  JWT_SECRET: Joi.string().required().description("JWT Secret key"),
  JWT_EXPIRY: Joi.string().required().description("JWT Expiry time"),
  SMTP_HOST: Joi.string().required().description("SMTP Host"),
  SMTP_PORT: Joi.number().required().description("SMTP Port"),
  SMTP_USERNAME: Joi.string().required().description("SMTP Username"),
  SMTP_PASSWORD: Joi.string().required().description("SMTP Password"),
  EMAIL_FROM: Joi.string().email().required().description("Email From Address"),
}).unknown();

const { value, error } = validator.validate(process.env);

if (error) throw new Error(error.message);

const env = {
  PORT: value.PORT,
  MONGO_URI: value.MONGO_URI,
  ENVIRONMENT: value.NODE_ENV,
  DEBUG: value.NODE_ENV === "development",
  jwt: {
    secret: value.JWT_SECRET,
    expiry: value.JWT_EXPIRY,
  },
  email: {
    provider: {
      host: value.SMTP_HOST,
      port: value.SMTP_PORT,
      secure: false, // true for 465, false for other ports
      auth: {
        user: value.SMTP_USERNAME,
        pass: value.SMTP_PASSWORD,
      },
    },
    from: value.EMAIL_FROM,
  },
};
export default env;
