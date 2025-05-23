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

socket.on("connect", () => {
  console.log("[Socket] connected:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.log("[Socket] disconnected:", reason);
});

socket.on("connect_error", (error) => {
  console.error("[Socket] connect_error:", error);
});

socket.on("connect_timeout", (timeout) => {
  console.error("[Socket] connect_timeout:", timeout);
});

socket.on("error", (error) => {
  console.error("[Socket] error:", error);
});

socket.on("reconnect_attempt", (attempt) => {
  console.log("[Socket] reconnect_attempt:", attempt);
});

socket.on("reconnect", (attempt) => {
  console.log("[Socket] reconnect:", attempt);
});

socket.on("reconnect_error", (error) => {
  console.error("[Socket] reconnect_error:", error);
});

socket.on("reconnect_failed", () => {
  console.error("[Socket] reconnect_failed");
});

socket.on("ping", () => {
  console.log("[Socket] ping");
});

socket.on("pong", () => {
  console.log("[Socket] pong");
});


