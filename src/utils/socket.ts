import { Server, Socket } from "socket.io";
import logger from "./logger";
import socketAuth from "../middlewares/socketAuth";
import messageSocket from "../modules/message/message.socket";

export default function socketIO(io: Server) {
  io.use(async (socket: Socket, next: (err?: Error) => void) => {
    await socketAuth(socket, next);
  });

  io.on("connection", (socket: any) => {
    logger.success(`${socket.id} connected`);
    messageSocket(io, socket);
    io.on("disconnect", () => {
      logger.success(`${socket.id} disconnected`);
    });
  });
}
