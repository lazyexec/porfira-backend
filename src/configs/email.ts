import env from "./env.ts";
import logger from "../utils/logger.ts";
import nodemailer from "nodemailer";

// Create a test account or replace with real credentials.
const transporter = nodemailer.createTransport(env.email.provider);

const sendMail = async (options: nodemailer.SendMailOptions) => {
  await transporter.sendMail({
    from: env.email.from,
    ...options,
  });
};

const sendRegistrationEmail = async (to: string, token: string) => {
  logger.info(`Sending registration email to ${to} with token ${token}`);
  console.log("Email sent successfully");
  await sendMail({
    to,
    subject: "Registration Confirmation",
    text: `Please confirm your registration using this token: ${token}`,
  });
  // Implementation for sending registration email
};

const sendResetPasswordEmail = async (to: string, token: string) => {
  await sendMail({
    to,
    subject: "Reset Password",
    text: `Please Recover your account using this code: ${token}`,
  });
  // Implementation for sending reset password email
  logger.info(`Sending reset password email to ${to} with token ${token}`);
};

export default {
  sendRegistrationEmail,
  sendResetPasswordEmail,
};
