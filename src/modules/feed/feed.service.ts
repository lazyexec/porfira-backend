import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import User from "../user/user.model.ts";

const queryTeachers = async (filter: any, options: object) => {
  const query: any = {
    isDeleted: false,
    role: "teacher",
    isEmailVerified: true,
    teacher: {
      isAccepted: true,
    },
  };

  for (const key of Object.keys(filter)) {
    if (key === "minPrice" || key === "maxPrice") {
      query.teacher.hourlyRate = {
        $gte: filter.minPrice,
        $lte: filter.maxPrice,
      };
    } else if (key === "minExperience" || key === "maxExperience") {
      query.teacher.yearsOfTeachingExp = {
        $gte: filter.minExperience,
        $lte: filter.maxExperience,
      };
    } else if (key === "minRating" || key === "maxRating") {
      query.teacher.rating = { $gte: filter.minRating, $lte: filter.maxRating };
    } else if (key === "subjects") {
      query.teacher.subjectsTaught = { $in: filter.subjects };
    } else if (
      (key === "name" || key === "subject" || key === "language") &&
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

const queryStudents = async (filter: any, options: object) => {
  const query: any = {
    isDeleted: false,
    role: "student",
    isEmailVerified: true,
    teacher: {
      isAccepted: true,
    },
  };

  for (const key of Object.keys(filter)) {
    if (key === "minPrice" || key === "maxPrice") {
      query.teacher.hourlyRate = {
        $gte: filter.minPrice,
        $lte: filter.maxPrice,
      };
    } else if (key === "minExperience" || key === "maxExperience") {
      query.teacher.yearsOfTeachingExp = {
        $gte: filter.minExperience,
        $lte: filter.maxExperience,
      };
    } else if (key === "minRating" || key === "maxRating") {
      query.teacher.rating = { $gte: filter.minRating, $lte: filter.maxRating };
    } else if (key === "subjects") {
      query.teacher.subjectsTaught = { $in: filter.subjects };
    } else if (
      (key === "name" || key === "subject" || key === "language") &&
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

export default {
  queryTeachers,
  queryStudents
};
