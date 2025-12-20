import type { Types } from "mongoose";
import User from "./user.model";
import email from "../../configs/email";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import fs from "../../utils/fs";
import mongoose from "mongoose";
import env from "../../configs/env";
import { IUser } from "./user.interface";

interface UploadedFiles {
  avatar?: Express.Multer.File[];
  content?: Express.Multer.File[];
  documents?: Express.Multer.File[];
}

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

const updateUser = async (
  userId: string,
  updateBody: object,
  files: UploadedFiles
) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (files) {
    if (files.avatar?.[0]) {
      fs.deleteLocalFile(user.avatar);
      const file = files.avatar[0];
      user.avatar = env.BACKEND_URL + "/public" + fs.sanitizePath(file.path);
    }

    if (user.role === "teacher" && files.content?.[0]) {
      const file = files.content[0];
      user.teacher = user.teacher ?? {};
      fs.deleteLocalFile(user.teacher?.content!);
      user.teacher.content =
        env.BACKEND_URL + "/public" + fs.sanitizePath(file.path);
    }

    // Handle teacher documents (max 2 PDFs)
    if (user.role === "teacher" && files.documents) {
      if (files.documents.length > 2) {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Maximum 2 documents allowed"
        );
      }

      if (user.teacher?.documents?.length) {
        await Promise.all(
          user.teacher.documents.map((doc) => fs.deleteLocalFile(doc))
        );
      }

      user.teacher = user.teacher ?? {};
      user.teacher.documents = files.documents.map(
        (file) => env.BACKEND_URL + "/public" + fs.sanitizePath(file.path)
      );
    }
  }

  Object.assign(user, updateBody);

  await user.save();

  return user;
};

const getUserById = async (userId: string) => {
  return User.findById(new mongoose.Types.ObjectId(userId));
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
  const users = await User.paginate(query, options);
  return users;
};

const restrictUser = async (userId: string, reason: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isRestricted: true, restrictionReason: reason },
    { new: true }
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await email.sendRestrictionEmail(user.email, reason);
};

const unRestrictUser = async (userId: string) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { isRestricted: false, restrictionReason: null },
    { new: true }
  );

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await email.sendUnrestrictedEmail(user.email);
};

const deleteUser = async (userId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { isDeleted: true },
    { new: true }
  );
};

const recoverUser = async (userId: string) => {
  return await User.findByIdAndUpdate(
    userId,
    { isDeleted: false },
    { new: true }
  );
};

const addUser = async (
  name: string,
  email: string,
  role: string,
  password: string,
  files: UploadedFiles
) => {
  let userObject: IUser = {
    name,
    email,
    role,
    password,
    isEmailVerified: true,
  };

  if (await User.isEmailTaken(email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  }

  if (files) {
    if (files.avatar?.[0]) {
      const file = files.avatar[0];
      userObject = {
        ...userObject,
        avatar: env.BACKEND_URL + "/public" + fs.sanitizePath(file.path),
      };
    }
  }
  const user = await User.create(userObject);
  return user;
};

export default {
  getUserByEmail,
  updateUser,
  getUserById,
  getGenuineTeacher,
  syncTeacherBalance,
  // Admin Functions
  queryAllUsers,
  restrictUser,
  unRestrictUser,
  addUser,
  deleteUser,
  recoverUser,
};
