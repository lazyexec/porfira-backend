import { Server, Socket } from "socket.io";
import supportService from "./support.service";
import logger from "../../utils/logger";

const supportSocket = (io: Server, socket: Socket) => {
    // Join a support ticket room
    socket.on("join-support-ticket", async ({ ticketId }) => {
        try {
            const isPartOfTicket = await supportService.isUserPartOfTicket(
                socket.user?.id,
                ticketId,
                socket.user?.role === "admin"
            );

            if (!isPartOfTicket) {
                socket.emit("error", { message: "Access denied to this ticket" });
                return;
            }

            socket.join(`support-${ticketId}`);
            logger.info(`User ${socket.user?.id} joined support ticket ${ticketId}`);
        } catch (error: any) {
            logger.error("Error joining support ticket:", error);
            socket.emit("error", { message: error.message });
        }
    });

    // Leave a support ticket room
    socket.on("leave-support-ticket", ({ ticketId }) => {
        socket.leave(`support-${ticketId}`);
        logger.info(`User ${socket.user?.id} left support ticket ${ticketId}`);
    });

    // Send a support message
    socket.on(
        "send-support-message",
        async ({ ticketId, content }: { ticketId: string; content: string }) => {
            try {
                const isAdmin = socket.user?.role === "admin";
                const message = await supportService.createMessage(
                    ticketId,
                    socket.user?.id,
                    content,
                    isAdmin
                );

                // Emit to all users in the ticket room
                io.to(`support-${ticketId}`).emit("new-support-message", {
                    ticketId,
                    message,
                });

                // Notify about ticket update
                io.to(`support-${ticketId}`).emit("support-ticket-updated", {
                    ticketId,
                    lastMessageAt: message.createdAt,
                });
            } catch (error: any) {
                logger.error("Error sending support message:", error);
                socket.emit("error", { message: error.message });
            }
        }
    );

    // Typing indicator
    socket.on("typing-support", ({ ticketId, isTyping }) => {
        socket.to(`support-${ticketId}`).emit("user-typing-support", {
            ticketId,
            userId: socket.user?.id,
            userName: socket.user?.name,
            isTyping,
            isAdmin: socket.user?.role === "admin",
        });
    });

    // Update ticket status
    socket.on("update-support-status", async ({ ticketId, status }) => {
        try {
            const isAdmin = socket.user?.role === "admin";
            const ticket = await supportService.updateTicketStatus(
                ticketId,
                status,
                socket.user?.id,
                isAdmin
            );

            // Notify all users in the ticket room
            io.to(`support-${ticketId}`).emit("support-status-changed", {
                ticketId,
                status: ticket.status,
                updatedBy: {
                    id: socket.user?.id,
                    name: socket.user?.name,
                    isAdmin,
                },
            });
        } catch (error: any) {
            logger.error("Error updating support status:", error);
            socket.emit("error", { message: error.message });
        }
    });

    // Admin joined notification
    socket.on("admin-joined-support", ({ ticketId }) => {
        if (socket.user?.role === "admin") {
            socket.to(`support-${ticketId}`).emit("admin-joined-ticket", {
                ticketId,
                admin: {
                    id: socket.user?.id,
                    name: socket.user?.name,
                },
            });
        }
    });
};

export default supportSocket;
