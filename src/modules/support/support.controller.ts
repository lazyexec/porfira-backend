import type { Request, Response } from "express";
import catchAsync from "../../utils/catchAsync";
import supportService from "./support.service";
import httpStatus from "http-status";
import pick from "../../utils/pick";

/**
 * Create a new support ticket
 * @route POST /api/v1/support/tickets
 */
const createTicket = catchAsync(async (req: Request, res: Response) => {
    const { subject, priority, initialMessage } = req.body;
    const ticket = await supportService.createTicket(
        req.user?.id!,
        subject,
        priority || "medium",
        initialMessage
    );

    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Support ticket created successfully",
        data: ticket,
    });
});

/**
 * Get all tickets (filtered by user role)
 * @route GET /api/v1/support/tickets
 */
const getTickets = catchAsync(async (req: Request, res: Response) => {
    const filter = pick(req.query, ["status", "priority"]);
    const options = pick(req.query, ["sortBy", "limit", "page"]);

    const isAdmin = req.user?.role === "admin";
    const tickets = await supportService.getTickets(
        filter,
        options,
        req.user?.id,
        isAdmin
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Tickets retrieved successfully",
        data: tickets,
    });
});

/**
 * Get single ticket by ID
 * @route GET /api/v1/support/tickets/:ticketId
 */
const getTicket = catchAsync(async (req: Request, res: Response) => {
    const isAdmin = req.user?.role === "admin";
    const ticket = await supportService.getTicketById(
        req.params.ticketId,
        req.user?.id,
        isAdmin
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Ticket retrieved successfully",
        data: ticket,
    });
});

/**
 * Update ticket status
 * @route PATCH /api/v1/support/tickets/:ticketId/status
 */
const updateTicketStatus = catchAsync(async (req: Request, res: Response) => {
    const { status } = req.body;
    const user = req.user;
    const isAdmin = user?.role === "admin";

    const ticket = await supportService.updateTicketStatus(
        req.params.ticketId,
        status,
        user?.id!,
        isAdmin
    );

    // Emit socket event for realtime update
    if (global.io) {
        global.io.to(`support-${req.params.ticketId}`).emit("support-status-changed", {
            ticketId: req.params.ticketId,
            status: ticket.status,
            updatedBy: {
                id: user?.id,
                name: user?.name,
                isAdmin,
            },
        });
    }

    res.status(httpStatus.OK).json({
        success: true,
        message: "Ticket status updated successfully",
        data: ticket,
    });
});

/**
 * Send message to ticket (via REST API)
 * @route POST /api/v1/support/tickets/:ticketId/messages
 */
const sendMessage = catchAsync(async (req: Request, res: Response) => {
    const { content } = req.body;
    const isAdmin = req.user?.role === "admin";

    const message = await supportService.createMessage(
        req.params.ticketId,
        req.user?.id!,
        content,
        isAdmin
    );

    // Emit socket event for realtime update
    if (global.io) {
        global.io.to(`support-${req.params.ticketId}`).emit("new-support-message", {
            ticketId: req.params.ticketId,
            message,
        });
    }

    res.status(httpStatus.CREATED).json({
        success: true,
        message: "Message sent successfully",
        data: message,
    });
});

/**
 * Get messages for a ticket
 * @route GET /api/v1/support/tickets/:ticketId/messages
 */
const getMessages = catchAsync(async (req: Request, res: Response) => {
    const options = pick(req.query, ["sortBy", "limit", "page"]);
    const isAdmin = req.user?.role === "admin";

    const messages = await supportService.getMessages(
        req.params.ticketId,
        options,
        req.user?.id,
        isAdmin
    );

    res.status(httpStatus.OK).json({
        success: true,
        message: "Messages retrieved successfully",
        data: messages,
    });
});

export default {
    createTicket,
    getTickets,
    getTicket,
    updateTicketStatus,
    sendMessage,
    getMessages,
};
