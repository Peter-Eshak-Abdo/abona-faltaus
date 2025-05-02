import { Server } from "socket.io";

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Already set up");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    socket.on("start_exam", (data) => {
      io.to(data.roomId).emit("exam_started", data);
    });

    socket.on("next_question", (data) => {
      io.to(data.roomId).emit("new_question", data);
    });

    // socket.on("submit_answer", (data) => {
    //   // حفظ الإجابات في الذاكرة أو قاعدة بيانات
    // });
  });

  res.end();
}
