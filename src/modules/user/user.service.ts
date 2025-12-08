import type { Types } from "mongoose";
import User from "./user.model.ts";

const getUserByEmail = async (email: string) => {
  return User.findOne({ email });
};

const getGenuineTeacher = async (teacherId: string) => {
  return await User.findOne({
    _id: teacherId,
    role: "teacher",
    isDeleted: false,
    "teacher.status": "approved",
  });
};

const updateUser = async (userId: string, updateBody: object) => {
  const user = await User.findByIdAndUpdate(userId, updateBody, { new: true });
  return user;
};

const getUserById = async (userId: string) => {
  return User.findById(userId);
};

const syncTeacherBalance = async (teacherId: string, balance: number) => {
  await User.updateOne(
    { _id: teacherId },
    { $inc: { "teacher.balance": balance } }
  );
};
export default {
  getUserByEmail,
  updateUser,
  getUserById,
  getGenuineTeacher,
  syncTeacherBalance,
};
