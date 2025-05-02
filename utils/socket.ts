import { io } from "socket.io-client";

const socket = io({ path: "/api/socketio" });

export default socket;
