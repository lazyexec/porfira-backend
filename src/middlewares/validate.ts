import type { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import ApiError from "../utils/ApiError.ts";

const validate =
  (schema: { body?: any; query?: any; params?: any }) =>
  (req: Request, res: Response, next: NextFunction) => {
    const parts: Array<"body" | "query" | "params"> = [
      "body",
      "query",
      "params",
    ];

    try {
      for (const part of parts) {
        const s = schema[part];
        if (!s) continue;

        const { error, value } = s.validate((req as any)[part]);
        if (error) {
          return next(
            new ApiError(httpStatus.BAD_REQUEST, error.details[0].message)
          );
        }
        (req as any)[part] = value;
      }

      return next();
    } catch (err) {
      return next(new ApiError(httpStatus.BAD_REQUEST, (err as Error).message));
    }
  };

export default validate;
