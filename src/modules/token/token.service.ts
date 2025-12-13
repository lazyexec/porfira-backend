import { Types } from "mongoose";
import Token from "./token.model";
import jwt from "../../utils/jwt";
import ApiError from "../../utils/ApiError";
import status from "http-status";
import env from "../../configs/env";
import { daysToDate } from "../../utils/date";

const saveRefreshToken = async (opts: {
  userId: Types.ObjectId;
  token: string;
  deviceId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
  expiresAt?: Date;
}) => {
  const {
    userId,
    token,
    deviceId = null,
    ip = null,
    userAgent = null,
    expiresAt,
  } = opts;

  await Token.create({
    token,
    user: userId,
    type: "refresh",
    expires: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
    blacklisted: false,
    deviceId,
    ip,
    userAgent,
  });
};

const generateUserTokens = async (opts: {
  userId: Types.ObjectId;
  deviceId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}) => {
  const { userId, deviceId = null, ip = null, userAgent = null } = opts;

  const accessToken = jwt.generateToken(
    { _id: userId.toString(), type: "access" },
    env.jwt.expiryAccessToken
  );
  const refreshToken = jwt.generateToken(
    { _id: userId.toString(), type: "refresh" },
    env.jwt.expiryRefreshToken
  );

  const expiresAt = daysToDate(env.jwt.expiryRefreshToken);

  await saveRefreshToken({
    userId,
    token: refreshToken,
    deviceId,
    ip,
    userAgent,
    expiresAt,
  });

  return {
    access: {
      token: accessToken,
      expiresAt: daysToDate(env.jwt.expiryAccessToken),
    },
    refresh: {
      token: refreshToken,
      expiresAt,
    },
  };
};

const refreshAuth = async (
  refreshToken: string,
  opts?: {
    ip?: string | null;
    userAgent?: string | null;
    deviceId?: string | null;
  }
) => {
  let payload: any;
  try {
    payload = jwt.verifyToken(refreshToken);
  } catch (err) {
    throw new ApiError(status.FORBIDDEN, "Invalid refresh token (signature).");
  }

  if (!payload || payload.type !== "refresh") {
    throw new ApiError(status.FORBIDDEN, "Token is not a refresh token.");
  }

  const tokenDoc = await Token.findOne({
    token: refreshToken,
    type: "refresh",
  });

  if (!tokenDoc) {
    // possible replay or already rotated
    throw new ApiError(status.FORBIDDEN, "Refresh token not found.");
  }

  if (tokenDoc.blacklisted) {
    throw new ApiError(status.FORBIDDEN, "Refresh token blacklisted.");
  }

  if (tokenDoc.expires.getTime() < Date.now()) {
    // optionally remove doc
    await Token.deleteOne({ _id: tokenDoc._id }).catch(() => {});
    throw new ApiError(status.FORBIDDEN, "Refresh token expired.");
  }

  tokenDoc.lastUsedAt = new Date();
  if (opts?.ip) tokenDoc.ip = opts.ip;
  if (opts?.userAgent) tokenDoc.userAgent = opts.userAgent;
  await tokenDoc.save();

  // 4. Rotate: blacklist old refresh token and issue a new one.
  // You can either mark blacklisted=true or delete doc to prevent re-use.
  tokenDoc.blacklisted = true;
  tokenDoc.reason = "rotated";
  await tokenDoc.save();

  // Create new tokens
  const userId = new Types.ObjectId(payload._id);

  const newAccessToken = jwt.generateToken(
    { _id: userId.toString(), type: "access" },
    env.jwt.expiryAccessToken
  );
  const newRefreshToken = jwt.generateToken(
    { _id: userId.toString(), type: "refresh" },
    env.jwt.expiryRefreshToken
  );

  const newExpiresAt = daysToDate(env.jwt.expiryRefreshToken);

  await saveRefreshToken({
    userId,
    token: newRefreshToken,
    deviceId: opts?.deviceId ?? tokenDoc.deviceId ?? null,
    ip: opts?.ip ?? tokenDoc.ip ?? null,
    userAgent: opts?.userAgent ?? tokenDoc.userAgent ?? null,
    expiresAt: newExpiresAt,
  });

  return {
    access: {
      token: newAccessToken,
      expiresAt: newExpiresAt,
    },
    refresh: {
      token: newRefreshToken,
      expiresAt: newExpiresAt,
    },
  };
};

const revokeRefreshToken = async (token: string, reason = "user_logout") => {
  const tokenDoc = await Token.findOne({ token, type: "refresh" });
  if (!tokenDoc) return false;
  tokenDoc.blacklisted = true;
  tokenDoc.reason = reason;
  await tokenDoc.save();
  return true;
};

const revokeAllForUser = async (
  userId: Types.ObjectId,
  opts?: { reason?: string; deviceId?: string }
) => {
  const filter: any = { user: userId, type: "refresh", blacklisted: false };
  if (opts?.deviceId) filter.deviceId = opts.deviceId;
  const update: any = {
    $set: { blacklisted: true, reason: opts?.reason ?? "revoked_by_admin" },
  };
  await Token.updateMany(filter, update);
  return true;
};

const verifyAccessToken = (rawAccessToken: string) => {
  try {
    const payload = jwt.verifyToken(rawAccessToken);
    if (!payload) throw new Error("invalid token");
    if (payload.type !== "access") throw new Error("invalid token type");
    return payload; // contains _id and other claims
  } catch (err) {
    throw new ApiError(status.UNAUTHORIZED, "Invalid access token.");
  }
};

/** Find active sessions for a user (for session listing) */
const listUserSessions = async (userId: Types.ObjectId) => {
  return Token.find({ user: userId, type: "refresh", blacklisted: false })
    .select("-token")
    .lean();
};

export default {
  generateUserTokens,
  refreshAuth,
  revokeRefreshToken,
  revokeAllForUser,
  verifyAccessToken,
  listUserSessions,
};
