import httpStatus from "http-status";
import jwt from "../utils/jwt.ts";
import ApiError from "../utils/ApiError.ts";
import { roleRights } from "../configs/roles.ts";
import type { Request, Response, NextFunction } from "express";
import passport from "passport";

const verifyCallback =
  (req: any, resolve: any, reject: any, requiredRights: any) =>
  async (err: any, user: any, info: any) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized")
      );
    }
    req.user = user;

    const { authorization } = req.headers;

    let token;
    let activity;
    let decodedData;
    if (authorization && authorization.startsWith("Bearer")) {
      token = authorization.split(" ")[1];
      decodedData = jwt.decodeToken(token);
      activity = decodedData.activity;
    }

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) || [];
      const hasRequiredRights = requiredRights.every((requiredRight: string) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights && req.params.userId !== user.id) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }
    if (user.isDeleted) {
      return reject(new ApiError(httpStatus.FORBIDDEN, "Unauthorized Request"));
    }
    if (user.isRestricted) {
      return reject(new ApiError(httpStatus.FORBIDDEN, "User is restricted"));
    }

    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return new Promise((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verifyCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    })
      .then(() => next())
      .catch((err) => next(err));
  };

export default auth;
