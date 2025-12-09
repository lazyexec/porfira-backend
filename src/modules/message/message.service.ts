import ApiError from "../../utils/ApiError.ts";
import { conversationModel, messageModel } from "./message.model.ts";
import httpStatus from "http-status";
import User from "../user/user.model.ts";

/*
    Conversation Services
*/

const isRolesAreSame = async (user1: string, user2: string) => {
  const users = await User.find({ _id: { $in: [user1, user2] } })
    .select("role")
    .lean();

  if (users.length !== 2) return false; // one of them doesn't exist
  return users[0]?.role === users[1]?.role;
};

const userUnderConversation = async (
  userId: string,
  conversationId: string
) => {
  const conversation = await conversationModel.findById(conversationId);
  if (!conversation) {
    throw new ApiError(httpStatus.NOT_FOUND, "Conversation not found");
  }
  return conversation.participants.some(
    (participant) => participant.toString() === userId
  );
};

const createConversation = async (userId1: string, userId2: string) => {
  if (userId1 === userId2) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User IDs cannot be the same");
  }

  const roleVarif = await isRolesAreSame(userId1, userId2);

  if (roleVarif) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Same role Chat Not Acceptable!"
    );
  }

  const conversation = await conversationModel.findByParticipants(
    userId1,
    userId2
  );
  if (!conversation) {
    const newConversation = await conversationModel.create({
      participants: [userId1, userId2],
    });
    return newConversation;
  }
  return conversation;
};

const getConversation = async (userId: string, conversationId: string) => {
  const conversation = await conversationModel.findOne({
    participant: { $in: userId },
    _id: conversationId,
  });
  return conversation;
};

const getConversations = async (userId: string, options: any) => {
  const query = { participants: { $in: userId } };
  const conversations = await conversationModel.paginate(query, options);
  return conversations;
};

const deleteConversation = async (id: string) => {
  const conversation = await conversationModel.findByIdAndDelete(id);
  await messageModel.deleteMany({ conversation: id });
  return conversation;
};

/*
    Message Services
*/
const createMessage = async (
  conversation: string,
  sender: string,
  type: string,
  content: string
) => {
  const message = await messageModel.create({
    conversation,
    sender,
    type,
    content,
  });
  return message;
};

const getMessage = async (id: string) => {
  const message = await messageModel.findById(id);
  return message;
};

const getMessages = async (conversationId: string, options: any) => {
  const messages = await messageModel.paginate(
    { conversation: conversationId },
    options
  );
  return messages;
};

const deleteMessage = async (id: string) => {
  const message = await messageModel.findByIdAndDelete(id);
  return message;
};

const updateMessage = async (id: string, content: string) => {
  const message = await messageModel.findByIdAndUpdate(id, { content });
  return message;
};

const readMessage = async (id: string, userId: string) => {
  const message = await messageModel.findByIdAndUpdate(id, { readBy: userId });
  return message;
};

export default {
  // Conversation Services
  createConversation,
  getConversation,
  getConversations,
  deleteConversation,
  userUnderConversation,
  // Message Services
  createMessage,
  getMessage,
  getMessages,
  deleteMessage,
  updateMessage,
  readMessage,
};
