import { Server, Socket } from "socket.io";
import messageServices from "./message.service.ts";

const messageSocket = (io: Server, socket: Socket) => {
  socket.on("join-conversation", async ({ conversationId }) => {
    const isMember = await messageServices.userUnderConversation(
      socket.user?.id,
      conversationId
    );
    if (!isMember) return;
    socket.join(conversationId);
  });

  // GET MESSAGES
  socket.on("get-messages", async ({ conversationId }) => {
    const messages = await messageServices.getMessages(
      conversationId,
      socket.user?.id
    );

    socket.emit("get-messages", messages);
  });

  // SEND MESSAGE
  socket.on("send-message", async ({ conversationId, type, content }) => {
    const message = await messageServices.createMessage(
      conversationId,
      socket.user?.id,
      type,
      content
    );

    io.to(conversationId).emit("new-message", message);
  });

  // DELETE MESSAGE
  socket.on("delete-message", async ({ conversationId, messageId }) => {
    const message = await messageServices.deleteMessage(messageId);
    io.to(conversationId).emit("delete-message", message);
  });

  // UPDATE MESSAGE
  socket.on(
    "update-message",
    async ({ conversationId, messageId, content }) => {
      const message = await messageServices.updateMessage(messageId, content);
      io.to(conversationId).emit("update-message", message);
    }
  );

  // READ MESSAGE
  socket.on("read-message", async ({ conversationId, messageId }) => {
    const message = await messageServices.readMessage(
      messageId,
      socket.user.id
    );

    io.to(conversationId).emit("read-message", message);
  });
};

export default messageSocket;
