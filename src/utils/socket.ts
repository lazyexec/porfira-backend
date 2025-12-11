import { Server, Socket } from "socket.io";
import logger from "./logger";
import socketAuth from "../middlewares/socketAuth";
import messageSocket from "../modules/message/message.socket";
import supportSocket from "../modules/support/support.socket";
import User from "../modules/user/user.model";

// Track online users: userId -> socketId
const onlineUsers = new Map<string, string>();

// Helper to check if user is online
export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};

// Helper to get all online user IDs
export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsers.keys());
};

export default function socketIO(io: Server) {
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    await socketAuth(socket, next);
  });

  io.on("connection", (socket: any) => {
    logger.success(`${socket.id} connected`);

    // Mark user as online
    if (socket.user?.id) {
      onlineUsers.set(socket.user.id, socket.id);
      // Broadcast to all clients that this user is online
      io.emit("user-online", { userId: socket.user.id });

      // Update database immediately on connect
      User.findByIdAndUpdate(socket.user.id, {
        isOnline: true,
        lastSeen: new Date(),
      }).catch((err) => logger.error("Error updating user online status:", err));
    }

    messageSocket(io, socket);
    supportSocket(io, socket);

    socket.on("disconnect", () => {
      // Mark user as offline
      if (socket.user?.id) {
        onlineUsers.delete(socket.user.id);
        // Broadcast to all clients that this user is offline
        io.emit("user-offline", { userId: socket.user.id });

        // Update database immediately on disconnect
        User.findByIdAndUpdate(socket.user.id, {
          isOnline: false,
          lastSeen: new Date(),
        }).catch((err) => logger.error("Error updating user offline status:", err));
      }
      logger.success(`${socket.id} disconnected`);
    });
  });
}
