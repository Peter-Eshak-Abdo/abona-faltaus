// socket.tsx
import { io, Socket } from "socket.io-client";
export const socket: Socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
  transports: ["polling"],
  // transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
});
