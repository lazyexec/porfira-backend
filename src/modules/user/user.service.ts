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

const queryAllUsers = async (filter: any, options: object) => {
  const query: any = {};

  for (const key of Object.keys(filter)) {
    if (
      (key === "name" || key === "email" || key === "role") &&
      filter[key] !== ""
    ) {
      query[key] = { $regex: filter[key], $options: "i" };
    } else if (filter[key] !== "") {
      query[key] = filter[key];
    }
  }
  console.log({ query, options });
  const users = await User.paginate(query, options);
  return users;
};

const restrctUser = async (userId: string) => {
  await User.updateOne({ _id: userId }, { isDeleted: true });
};

const unRestrctUser = async (userId: string) => {
  await User.updateOne({ _id: userId }, { isDeleted: false });
};
export default {
  getUserByEmail,
  updateUser,
  getUserById,
  getGenuineTeacher,
  syncTeacherBalance,
  // Admin Functions
  queryAllUsers,
  restrctUser,
  unRestrctUser,
};
