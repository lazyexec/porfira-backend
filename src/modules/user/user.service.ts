import type { Types } from "mongoose";
import User from "./user.model.ts";

const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

const getGenuineTeacher = async (teacherId: string) => {
  return await User.findOne({ _id: teacherId, role: "teacher", isDeleted: false, "teacher.isAccepted": true });
}

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
  getGenuineTeacher
};
