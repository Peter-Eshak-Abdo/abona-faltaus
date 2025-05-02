import type { Server as HTTPServer } from "http";
import type { Server as IOServer } from "socket.io";
import type { Socket as NetSocket } from "net";

export type NextApiResponseServerIO = {
  socket: NetSocket & {
    server: HTTPServer & {
      io: IOServer;
    };
  };
};
