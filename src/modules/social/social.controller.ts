import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";
import pick from "../../utils/pick.ts";
import feedService from "./social.service.ts";

const queryTeachers = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sort"]);
  const filter = pick(req.query, [
    "name",
    "subject",
    "language",
    "minExperience",
    "maxExperience",
    "rating",
    "minPrice",
    "maxPrice",
  ]);
  const review = await feedService.queryTeachers(filter, options);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Teachers fetched successfully",
      data: review,
    })
  );
});

const queryStudents = catchAsync(async (req: Request, res: Response) => {
  const options = pick(req.query, ["page", "limit", "sort"]);
  const filter = pick(req.query, [
    "name",
    "subject",
    "language",
  ]);
  const review = await feedService.queryStudents(filter, options);

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Teachers fetched successfully",
      data: review,
    })
  );
});

export default {
  queryTeachers,
  queryStudents,
};
