import { SupportTicket, SupportMessage } from "./support.model";
import User from "../user/user.model";
import ApiError from "../../utils/ApiError";
import httpStatus from "http-status";
import type { Types } from "mongoose";

/**
 * Create a new support ticket
 */
const createTicket = async (
  userId: string,
  subject: string,
  initialMessage: string
) => {
  // Create the ticket
  const ticket = await SupportTicket.create({
    user: userId,
    subject,
  });

  // Create the initial message
  const message = await SupportMessage.create({
    ticket: ticket._id,
    sender: userId,
    content: initialMessage,
    isAdminMessage: false,
  });

  // Update ticket with last message info
  ticket.lastMessage = message._id as Types.ObjectId;
  ticket.lastMessageAt = message.createdAt;
  await ticket.save();

  return ticket;
};

/**
 * Get tickets with filters
 */
const getTickets = async (
  filter: Record<string, any>,
  options: Record<string, any>,
  userId?: string,
  isAdmin?: boolean
) => {
  const query: Record<string, any> = { ...filter };

  // If user is not admin, only show their tickets
  if (!isAdmin && userId) {
    query.user = userId;
  }

  const tickets = await SupportTicket.paginate(query, {
    ...options,
    populate: [
      { path: "user", select: "name email avatar role" },
      { path: "lastMessage", select: "content createdAt" },
    ],
    sort: options.sort || "-lastMessageAt -createdAt",
  });

  return tickets;
};

/**
 * Get single ticket by ID
 */
const getTicketById = async (
  ticketId: string,
  userId?: string,
  isAdmin?: boolean
) => {
  const ticket = await SupportTicket.findById(ticketId).populate(
    "user",
    "name email avatar role"
  );

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Support ticket not found");
  }

  // Check if user has access to this ticket
  if (!isAdmin && ticket.user.toString() !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have access to this ticket"
    );
  }

  return ticket;
};

/**
 * Update ticket status
 */
const updateTicketStatus = async (
  ticketId: string,
  status: string,
  userId?: string,
  isAdmin?: boolean
) => {
  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Support ticket not found");
  }

  // Check permissions
  if (!isAdmin && ticket.user.toString() !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have permission to update this ticket"
    );
  }

  ticket.status = status as any;
  await ticket.save();

  return ticket;
};

/**
 * Create a message in a ticket
 */
const createMessage = async (
  ticketId: string,
  senderId: string,
  content: string,
  isAdmin: boolean
) => {
  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Support ticket not found");
  }

  // Check if user has access to this ticket
  if (!isAdmin && ticket.user.toString() !== senderId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have access to this ticket"
    );
  }

  const message = await SupportMessage.create({
    ticket: ticketId,
    sender: senderId,
    content,
    isAdminMessage: isAdmin,
  });

  // Update ticket's last message
  ticket.lastMessage = message._id as Types.ObjectId;
  ticket.lastMessageAt = message.createdAt;
  await ticket.save();

  // Populate sender info
  await message.populate("sender", "name email avatar role");

  return message;
};

/**
 * Get messages for a ticket
 */
const getMessages = async (
  ticketId: string,
  options: Record<string, any>,
  userId?: string,
  isAdmin?: boolean
) => {
  const ticket = await SupportTicket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(httpStatus.NOT_FOUND, "Support ticket not found");
  }

  // Check if user has access to this ticket
  if (!isAdmin && ticket.user.toString() !== userId) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "You don't have access to this ticket"
    );
  }

  const messages = await SupportMessage.paginate(
    { ticket: ticketId },
    {
      ...options,
      populate: { path: "sender", select: "name email avatar role" },
      sort: options.sort || "createdAt",
    }
  );

  return messages;
};

/**
 * Check if user is part of ticket
 */
const isUserPartOfTicket = async (
  userId: string,
  ticketId: string,
  isAdmin: boolean
): Promise<boolean> => {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) return false;

  if (isAdmin) return true;
  return ticket.user.toString() === userId;
};

export default {
  createTicket,
  getTickets,
  getTicketById,
  updateTicketStatus,
  createMessage,
  getMessages,
  isUserPartOfTicket,
};
