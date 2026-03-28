import env from "./env";
import logger from "../utils/logger";
import * as brevo from "@getbrevo/brevo";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";

const transactionalEmailApi = new brevo.TransactionalEmailsApi();
transactionalEmailApi.setApiKey(
  brevo.TransactionalEmailsApiApiKeys.apiKey,
  env.email.apiKey
);

type SendMailOptions = {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
};

const sendMail = async (options: SendMailOptions) => {
  try {
    const recipients = (Array.isArray(options.to) ? options.to : [options.to])
      .filter(Boolean)
      .map((email) => ({ email }));

    if (!recipients.length) {
      throw new Error("At least one recipient is required");
    }

    const payload = new brevo.SendSmtpEmail();
    payload.sender = {
      email: env.email.from,
      name: env.email.senderName,
    };
    payload.to = recipients;
    payload.subject = options.subject;
    if (options.text) payload.textContent = options.text;
    if (options.html) payload.htmlContent = options.html;

    await transactionalEmailApi.sendTransacEmail(payload);
  } catch (error: any) {
    const message =
      error?.response?.body?.message || error?.message || "Unknown error";

    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Failed to Send Email: error: " + message
    );
  }
};

const sendRegistrationEmail = async (to: string, token: string) => {
  logger.info(`Sending registration email to ${to} with token ${token}`);
  await sendMail({
    to,
    subject: "Registration Confirmation",
    text: `Please confirm your registration using this token: ${token}`,
  });
  // Implementation for sending registration email
};

const sendVerifyAccountEmail = async (to: string, token: string) => {
  logger.info(`Sending registration email to ${to} with token ${token}`);
  await sendMail({
    to,
    subject: "Account Verification",
    text: `Please verify your account using this token: ${token}`,
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

const sendRestrictionEmail = async (to: string, reason: string) => {
  await sendMail({
    to,
    subject: "Account Restriction",
    text: `Your account has been restricted. Reason: ${reason}. Consider to contact support for assistance.`,
  });
  logger.info(`Sending restriction email to ${to}`);
};

const sendUnrestrictedEmail = async (to: string) => {
  await sendMail({
    to,
    subject: "Account Unrestricted",
    text: `Your account has been unrestricted. Enjoy your stay!`,
  });
  logger.info(`Sending unrestricted email to ${to}`);
};

export default {
  sendRegistrationEmail,
  sendResetPasswordEmail,
  sendRestrictionEmail,
  sendUnrestrictedEmail,
  sendVerifyAccountEmail
};
