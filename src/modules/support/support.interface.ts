import { Document, Model, Types } from "mongoose";

export interface ISupportTicket extends Document {
    user: Types.ObjectId | string;
    subject: string;
    status: "open" | "in-progress" | "resolved" | "closed";
    lastMessage?: Types.ObjectId | string;
    lastMessageAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISupportMessage extends Document {
    ticket: Types.ObjectId | string;
    sender: Types.ObjectId | string;
    content: string;
    isAdminMessage: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface ISupportTicketModel extends Model<ISupportTicket> {
    paginate(
        filter: Record<string, any>,
        options: Record<string, any>
    ): Promise<any>;
}

export interface ISupportMessageModel extends Model<ISupportMessage> {
    paginate(
        filter: Record<string, any>,
        options: Record<string, any>
    ): Promise<any>;
}
