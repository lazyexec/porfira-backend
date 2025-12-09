/* eslint-disable no-var */
import { Server, Socket } from "socket.io";

declare global {
  var io: Server | undefined;
  var socket: Socket | undefined;
  var user: any | undefined;
}

export {};
