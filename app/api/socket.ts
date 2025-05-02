// pages/api/socket.ts
import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import type { Server as HTTPServer } from "http";
// import type { Socket as NetSocket } from "net";
import type { NextApiResponseServerIO } from "@/types/next";

export const config = {
  api: { bodyParser: false },
};

const ioHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: HTTPServer = res.socket.server as HTTPServer;
    const io = new Server(httpServer, {
      path: "/api/socketio",
    });

    res.socket.server.io = io;

    io.on("connection", (socket) => {
      console.log("🟢 New client connected:", socket.id);

      socket.on("join-session", ({ sessionId, groupId }) => {
        socket.join(sessionId);
        socket.data.groupId = groupId;
        console.log(`Group ${groupId} joined session ${sessionId}`);
      });

      socket.on("submit-answer", (data) => {
        console.log("📨 Answer submitted:", data);
      });

      socket.on("send-question", ({ sessionId, question }) => {
        io.to(sessionId).emit("question", question);
      });

      socket.on("disconnect", () => {
        console.log("🔴 Client disconnected:", socket.id);
      });
    });
  }

  (res as unknown as NextApiResponse).status(200).send("Socket initialized");
};

export default ioHandler;
