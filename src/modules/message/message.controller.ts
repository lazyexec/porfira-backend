import catchAsync from "../../utils/catchAsync";
import type { Request, Response } from "express";
import messageService from "./message.service";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import response from "../../configs/response";
import pick from "../../utils/pick";
import fs from "../../utils/fs";
import env from "../../configs/env";

const createConversation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const targetId = req.params.targetId;
  if (!userId || !targetId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid user or target id");
  }
  const conversation = await messageService.createConversation(
    userId,
    targetId
  );
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Conversation",
      data: conversation,
    })
  );
});

const sendMessage = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const conversationId = req.params.conversationId;
  const file = req.file;
  let { type, content } = req.body;
  if (type !== "text" && file) {
    content = env.BACKEND_URL + '/public' + fs.sanitizePath(file.path);
  }

  if (!type || !content) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Invalid message type or content"
    );
  }
  const message = await messageService.createMessage(
    conversationId!,
    userId!,
    type,
    content
  );

  //TODO: send notification to target user
  io?.to(conversationId as string).emit("new-message", message);

  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Message",
      data: message,
    })
  );
});

const getMessages = catchAsync(async (req: Request, res: Response) => {
  const conversationId = req.params.conversationId;
  const filter = pick(req.query, ["search"]);
  const options = pick(req.query, ["page", "limit", "sort"]);
  if (!conversationId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid conversation id");
  }
  const messages = await messageService.getMessages(
    conversationId,
    filter,
    options
  );
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Messages",
      data: messages,
    })
  );
});

const getConversations = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const options = pick(req.query, ["page", "limit", "sort"]);
  const messages = await messageService.getConversations(userId!, options);
  res.status(httpStatus.OK).json(
    response({
      status: httpStatus.OK,
      message: "Messages",
      data: messages,
    })
  );
});
export default {
  createConversation,
  sendMessage,
  getMessages,
  getConversations,
};
