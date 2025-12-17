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
} from "./message.interface";

const conversationSchema = new Schema<IConversation>(
  {
    participants: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: "user", index: true },
      ],
      required: true,
      validate: {
        validator: (v: mongoose.Types.ObjectId[]) => v.length === 2,
        message: "1-to-1 conversation must have exactly 2 participants",
      },
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
      ref: "user",
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
      default: false,
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
conversationSchema.statics.findByParticipants = function (userId1, userId2) {
  const participants = [userId1, userId2].sort((a, b) =>
    a.toString().localeCompare(b.toString())
  );
  return this.findOne({
    participants,
  }).populate("participants", "name email avatar");
};

const conversationModel = mongoose.model<IConversation, IConversationModel>(
  "Conversation",
  conversationSchema
);

messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.plugin(mongoosePaginate);

messageSchema.post("save", async function (doc) {
  await mongoose.model("Conversation").findByIdAndUpdate(doc.conversation, {
    lastMessage: doc._id,
    lastMessageAt: doc.createdAt,
  });
});

const messageModel = mongoose.model<IMessage, IMessageModel>(
  "Message",
  messageSchema
);

export { conversationModel, messageModel };
