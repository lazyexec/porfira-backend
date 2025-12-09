import catchAsync from "../../utils/catchAsync.ts";
import type { Request, Response } from "express";
import messageService from "./message.service.ts";
import ApiError from "../../utils/ApiError.ts";
import httpStatus from "http-status";
import response from "../../configs/response.ts";

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
    content = file.path;
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
  const { page, limit } = req.query;
  if (!conversationId) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid conversation id");
  }
  const messages = await messageService.getMessages(conversationId, {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  });
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
};
