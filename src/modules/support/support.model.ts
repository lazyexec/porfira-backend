import mongoose, { Schema } from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import type {
  ISupportTicket,
  ISupportTicketModel,
  ISupportMessage,
  ISupportMessageModel,
} from "./support.interface";

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
      required: true,
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: false,
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

const supportMessageSchema = new Schema<ISupportMessage>(
  {
    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupportTicket",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    isAdminMessage: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add pagination plugin
supportTicketSchema.plugin(mongoosePaginate);
supportMessageSchema.plugin(mongoosePaginate);

// Indexes for better query performance
supportTicketSchema.index({ user: 1, status: 1 });
supportTicketSchema.index({ status: 1, lastMessageAt: -1 });
supportMessageSchema.index({ ticket: 1, createdAt: -1 });

const SupportTicket = mongoose.model<ISupportTicket, ISupportTicketModel>(
  "SupportTicket",
  supportTicketSchema
);

const SupportMessage = mongoose.model<ISupportMessage, ISupportMessageModel>(
  "SupportMessage",
  supportMessageSchema
);

export { SupportTicket, SupportMessage };
