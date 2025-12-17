import { Server, Socket } from "socket.io";
import messageServices from "./message.service";
import logger from "../../utils/logger";
import { isUserOnline } from "../../utils/socket";
import notificationService from "../notification/notification.service";

const messageSocket = (io: Server, socket: Socket) => {
  socket.on("join-conversation", async ({ conversationId }) => {
    console.log(socket.user?.id!, conversationId);
    // console.log(io, socket);
    try {
      const isMember = await messageServices.userUnderConversation(
        socket.user?.id!,
        conversationId
      );
      if (!isMember) {
        socket.emit("error", { message: "Access denied to this conversation" });
        return;
      }
      socket.join(conversationId);
    } catch (error: any) {
      logger.error("Error joining conversation:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // GET MESSAGES
  socket.on("get-messages", async ({ conversationId }) => {
    try {
      const options = {
        sort: "createdAt -1",
        populate: { path: "sender", select: "name email avatar role" },
      };
      const messages = await messageServices.getMessages(
        conversationId,
        {},
        options
      );

      socket.emit("get-messages", messages);
    } catch (error: any) {
      logger.error("Error getting messages:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // SEND MESSAGE
  socket.on("send-message", async ({ conversationId, type, content }) => {
    try {
      const message = await messageServices.createMessage(
        conversationId,
        socket.user?.id!,
        type,
        content
      );
      // Populate sender info before emitting
      await message.populate("sender", "name email avatar role");

      io.to(conversationId).emit("new-message", message);
      // send Notification if user is Offline
      const recieverId = (await messageServices.getOtherParticipant(
        conversationId,
        socket.user?.id!
      )) as string;
      if (!recieverId) {
        return;
      } 
      if (!isUserOnline(recieverId)) {
        await notificationService.createNotification(
          recieverId,
          "New Message",
          "You have a new message from " + socket.user?.name,
          "personal"
        );
      } 
    } catch (error: any) {
      logger.error("Error sending message:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // DELETE MESSAGE
  socket.on("delete-message", async ({ conversationId, messageId }) => {
    try {
      const message = await messageServices.deleteMessage(messageId);
      io.to(conversationId).emit("delete-message", message);
    } catch (error: any) {
      logger.error("Error deleting message:", error);
      socket.emit("error", { message: error.message });
    }
  });

  // UPDATE MESSAGE
  socket.on(
    "update-message",
    async ({ conversationId, messageId, content }) => {
      try {
        const message = await messageServices.updateMessage(messageId, content);
        io.to(conversationId).emit("update-message", message);
      } catch (error: any) {
        logger.error("Error updating message:", error);
        socket.emit("error", { message: error.message });
      }
    }
  );

  // READ MESSAGE
  socket.on("read-message", async ({ conversationId, messageId }) => {
    try {
      const message = await messageServices.readMessage(
        messageId,
        socket.user?.id!
      );

      io.to(conversationId).emit("read-message", message);
    } catch (error: any) {
      logger.error("Error reading message:", error);
      socket.emit("error", { message: error.message });
    }
  });
};

export default messageSocket;
