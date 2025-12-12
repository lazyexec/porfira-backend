import httpStatus from "http-status";
import ApiError from "../utils/ApiError";
import { roleRights } from "../configs/roles";
import type { Request, Response, NextFunction } from "express";
import passport from "passport";

const verifyCallback =
  (
    req: Request,
    resolve: (value?: unknown) => void,
    reject: (reason?: any) => void,
    requiredRights: string[]
  ) =>
  async (err: any, user: any, info: any) => {
    if (err || info || !user) {
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "You are not authorized")
      );
    }
    req.user = user;

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role) || [];
      const hasRequiredRights = requiredRights.every((requiredRight: string) =>
        userRights.includes(requiredRight)
      );
      // This is a critical security flaw. The ownership check should be handled
      // separately in the controller or a dedicated middleware, not as a fallback.
      // Example: if (!hasRequiredRights && req.params.userId !== user.id)
      if (!hasRequiredRights) {
        return reject(new ApiError(httpStatus.FORBIDDEN, "Forbidden"));
      }
    }
    if (user.isDeleted) {
      // Use UNAUTHORIZED for authentication-level issues.
      return reject(
        new ApiError(httpStatus.UNAUTHORIZED, "User account has been deleted")
      );
    }
    if (user.isRestricted) {
      return reject(new ApiError(httpStatus.FORBIDDEN, "User is restricted"));
    }

    resolve();
  };

const auth =
  (...requiredRights: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
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
