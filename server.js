import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// const allowedOrigins = [
//   "http://localhost:3000",
//   "https://abona-faltaus.vercel.app",
// ];

const io = new Server(httpServer, {
  cors: {
    // origin: (origin, callback) => {
    //   // origin قد يكون undefined في بعض حالات polling
    //   if (!origin || allowedOrigins.includes(origin)) {
    //     callback(null, true);
    //   } else {
    //     callback(new Error("Not allowed by CORS"));
    //   }
    // },
    origin: true, // اسمح لكل الـ origins
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit("participant-joined");
  });
  // حدث إرسال السؤال من الأدمن
  socket.on("send-question", ({ roomId, question }) => {
    socket.to(roomId).emit("new-question", question);
  });

  // انتهاء الامتحان
  socket.on("exam-finished", ({ roomId }) => {
    io.to(roomId).emit("exam-ended");
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

// httpServer.listen(3001, () => {console.log("🚀 Socket server running on port 3001");});

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`🚀 Socket server running on port ${port}`);
});
