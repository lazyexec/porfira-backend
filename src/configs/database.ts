import mongoose from "mongoose";
import env from "./env";
import ApiError from "../utils/ApiError";
import httpStatus from "http-status";
import logger from "../utils/logger";

const connect = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info("MongoDB connected Successfully");
  } catch (err: any) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, err.message);
  }
};

export default { connect };
