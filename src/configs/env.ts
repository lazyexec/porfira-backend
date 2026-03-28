import { configDotenv } from "dotenv";
import Joi from "joi";

// if (process.env.NODE_ENV !== "production") {
configDotenv();
// }

const validator = Joi.object({
  PORT: Joi.number().default(3000),
  BACKEND_IP: Joi.string().default("localhost"),
  SOCKET_PORT: Joi.number().default(3001), // This is for only testing purpose (Development)
  MONGO_URI: Joi.string().optional(),
  NODE_ENV: Joi.string()
    .valid("development", "production")
    .default("development"),
  JWT_SECRET: Joi.string().required().description("JWT Secret key"),
  JWT_ACCESS_EXPIRY: Joi.string()
    .default("3d")
    .description("JWT Access Expiry time"),
  JWT_REFRESH_EXPIRY: Joi.string()
    .default("30d")
    .description("JWT Refresh Expiry time"),
  BREVO_API_KEY: Joi.string().required().description("Brevo API Key"),
  BREVO_SENDER_NAME: Joi.string()
    .default("Porfira")
    .description("Brevo Sender Name"),
  EMAIL_FROM: Joi.string().email().required().description("Email From Address"),
  STRIPE_SECRET_KEY: Joi.string().required().description("Stripe Secret Key"),
  STRIPE_WEBHOOK_SECRET: Joi.string()
    .required()
    .description("Stripe Webhook Secret Key"),
  // URLS
  FRONTEND_URL: Joi.string()
    .default("http://localhost:3000")
    .description("Frontend URL (single URL or comma-separated URLs)"),
  BACKEND_URL: Joi.string()
    .uri({ scheme: [/https?/] })
    .default(`http://${process.env.BACKEND_IP || "localhost"}:${process.env.PORT || 3000}`)
    .description("Frontend URL"),
  FIREBASE_PROJECT_ID: Joi.string()
    .required()
    .description("Firebase project Id"),
  FIREBASE_PRIVATE_KEY: Joi.string()
    .required()
    .description("Firebase Private Key"),
  FIREBASE_CLIENT_EMAIL: Joi.string()
    .required()
    .description("Firebase Client Email"),
}).unknown();

const { value, error } = validator.validate(process.env);

if (error) throw new Error(error.message);

const parsedFrontendUrls = value.FRONTEND_URL
  .split(",")
  .map((url: string) => url.trim())
  .filter(Boolean);

for (const url of parsedFrontendUrls) {
  const { error: urlError } = Joi.string()
    .uri({ scheme: [/https?/] })
    .validate(url);
  if (urlError) {
    throw new Error(`Invalid FRONTEND_URL entry: ${url}`);
  }
}

const env = {
  PORT: value.PORT,
  BACKEND_IP: value.BACKEND_IP,
  SOCKET_PORT: value.SOCKET_PORT,
  MONGO_URI: value.MONGO_URI,
  ENVIRONMENT: value.NODE_ENV,
  DEBUG: value.NODE_ENV === "development",
  jwt: {
    secret: value.JWT_SECRET,
    expiryAccessToken: value.JWT_ACCESS_EXPIRY,
    expiryRefreshToken: value.JWT_REFRESH_EXPIRY,
  },
  email: {
    apiKey: value.BREVO_API_KEY,
    senderName: value.BREVO_SENDER_NAME,
    from: value.EMAIL_FROM,
  },
  // STRIPE ACCOUNT
  STRIPE_SECRET_KEY: value.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: value.STRIPE_WEBHOOK_SECRET,
  // URLS
  FRONTEND_URL: parsedFrontendUrls[0],
  FRONTEND_URLS: parsedFrontendUrls,
  BACKEND_URL: value.BACKEND_URL,
  // Firebase Config
  firebase: {
    projectId: value.FIREBASE_PROJECT_ID || "",
    clientEmail: value.FIREBASE_CLIENT_EMAIL || "",
    privateKey: value.FIREBASE_PRIVATE_KEY
      ? value.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
      : undefined,
  },
};
export default env;
