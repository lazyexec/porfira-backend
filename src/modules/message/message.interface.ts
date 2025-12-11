import { Document, Model, Types } from "mongoose";

interface IConversation extends Document {
  participants: Types.ObjectId[] | string[];
  lastMessage: Types.ObjectId | string;
  lastMessageAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface IMessage extends Document {
  conversation: Types.ObjectId | string;
  sender: Types.ObjectId | string;
  type: string;
  content: string;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  readAt?: Date;
}

export interface IConversationModel extends Model<IConversation> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
  findByParticipants(userId1: string, userId2: string): Promise<IConversation | null>;
}

export interface IMessageModel extends Model<IMessage> {
  paginate(
    filter: Record<string, any>,
    options: Record<string, any>
  ): Promise<any>;
}

export type { IConversation, IMessage };
