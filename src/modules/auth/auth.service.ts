import emailHelper from "../../configs/email";
import ApiError from "../../utils/ApiError";
import { randomOtp } from "../../utils/otp";
import User from "../user/user.model";
import http from "http-status";
import Token from "../token/token.model";
import logger from "../../utils/logger";

const register = async (userData: object) => {
  const otp = randomOtp();
  const user = new User(userData);
  user.oneTimeCode = otp;
  user.onTimeCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  await user.save();
  setImmediate(() => {
    emailHelper
      .sendRegistrationEmail(user.email, otp)
      .catch((err) => logger.error(err));
  });
  return user;
};

const verifyAccount = async (email: string, code: string) => {
  const user = await User.findOne({ email, oneTimeCode: code });
  if (!user) {
    throw new ApiError(http.FORBIDDEN, "Invalid code or email");
  }
  if (user.isEmailVerified && !user.isResetPassword) {
    throw new ApiError(http.BAD_REQUEST, "Email is already verified");
  }
  if (user.onTimeCodeExpires && user.onTimeCodeExpires < new Date()) {
    await User.findOneAndUpdate(
      { email, oneTimeCode: code },
      { oneTimeCode: null, onTimeCodeExpires: null }
    );
    throw new ApiError(http.FORBIDDEN, "OTP has expired");
  }
  user.isEmailVerified = true;
  user.oneTimeCode = null;
  user.onTimeCodeExpires = null;
  await user.save();
  return user;
};

const login = async (email: string, password: string) => {
  const user = await User.findOne({ email, isDeleted: false });
  if (!user || !(await user.isPasswordMatch(password))) {
    throw new ApiError(http.UNAUTHORIZED, "Incorrect email or password");
  }
  if (!user.isEmailVerified) {
    throw new ApiError(http.UNAUTHORIZED, "Email not verified");
  }
  if (user.isRestricted) {
    throw new ApiError(
      http.FORBIDDEN,
      "Your account has been restricted. Contact support for assistance."
    );
  }
  return user;
};

const forgotPassword = async (email: string) => {
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    throw new ApiError(http.NOT_FOUND, "User not found");
  }
  const otp = randomOtp();
  user.oneTimeCode = otp;
  user.onTimeCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  user.isResetPassword = true;
  await emailHelper.sendResetPasswordEmail(user.email, otp);
  await user.save();
  return user;
};

const resetPassword = async (email: any, otp: string, newPassword: string) => {
  const user = await User.findOne({ email, isDeleted: false });
  if (!user) {
    throw new ApiError(http.UNAUTHORIZED, "User not found");
  }
  if (user.oneTimeCode !== otp) {
    throw new ApiError(http.FORBIDDEN, "Invalid OTP code");
  }
  if (user.onTimeCodeExpires && user.onTimeCodeExpires < new Date()) {
    throw new ApiError(http.FORBIDDEN, "OTP has expired");
  }
  // Check if new password is same as old password
  if (await user.isPasswordMatch(newPassword)) {
    throw new ApiError(
      http.BAD_REQUEST,
      "New password must be different from the old password"
    );
  }
  user.password = newPassword;
  user.isResetPassword = false;
  await user.save();
  return user;
};

const changePassword = async (
  userId: any,
  oldPassword: string,
  newPassword: string
) => {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw new ApiError(http.UNAUTHORIZED, "User not found");
  }
  if (!(await user.isPasswordMatch(oldPassword))) {
    throw new ApiError(http.BAD_REQUEST, "Old password is incorrect");
  }

  if (oldPassword === newPassword) {
    throw new ApiError(
      http.BAD_REQUEST,
      "New password must be different from the old password"
    );
  }

  user.password = newPassword;
  await user.save();
  return user;
};

const deleteAccount = async (userId: any) => {
  const user = await User.findOne({ _id: userId, isDeleted: false });
  if (!user) {
    throw new ApiError(http.UNAUTHORIZED, "User not found");
  }
  const token = await Token.findOne({ user: user._id });
  if (!token) {
    throw new ApiError(http.UNAUTHORIZED, "User not found");
  }
  await token.deleteOne();
  user.isDeleted = true;
  await user.save();
  return user;
};

export default {
  // Utility Functions
  // getUserByEmail,
  // Auth Functions
  register,
  verifyAccount,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  deleteAccount,
};
