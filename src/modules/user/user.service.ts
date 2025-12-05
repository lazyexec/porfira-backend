import type { Types } from "mongoose";
import User from "./user.model.ts";

const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

const updateUser = async (userId: string, updateBody: object) => {
  const user = await User.findByIdAndUpdate(userId, updateBody, { new: true });
  return user;
};

const getUserById = async (userId: string) => {
  return User.findById(userId);
};

const getAllUsers = async () => {
  return User.find();
};

export default {
  getUserByEmail,
  updateUser,
  getUserById,
};
