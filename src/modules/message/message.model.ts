/*
- Both models are using mongoose-paginate-v2 plugin
- conversationSchema has participants array of user ids
- conversationSchema has lastMessage and lastMessageAt fields
- messageSchema has conversation and sender fields
- messageSchema has type, content and isRead fields
*/

import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type {
  IConversation,
  IConversationModel,
  IMessage,
  IMessageModel,
} from "./message.interface.ts";

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "Message",
    },
    lastMessageAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const messageSchema = new Schema<IMessage>(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Conversation",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["text", "image", "video", "file"],
      default: "text",
    },
    content: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      required: false,
    },
    readAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

conversationSchema.plugin(mongoosePaginate);

// Index for faster queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Method to check if conversation exists between two users
conversationSchema.statics.findByParticipants = async function (
  userId1,
  userId2
) {
  return this.findOne({
    participants: { $all: [userId1, userId2], $size: 2 },
  });
};

const conversationModel = mongoose.model<IConversation, IConversationModel>(
  "Conversation",
  conversationSchema
);

messageSchema.plugin(mongoosePaginate);

const messageModel = mongoose.model<IMessage, IMessageModel>(
  "Message",
  messageSchema
);

export { conversationModel, messageModel };
