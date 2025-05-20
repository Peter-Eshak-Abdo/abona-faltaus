// server.ts أو index.js حسب بيئة Glitch
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import express from "express";
import { fileURLToPath } from "url";
import { dirname } from "path";

const app = express();
const httpServer = createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === Middleware ===
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// === Health Check ===
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// === Static Files ===
app.use("/public", express.static(path.join(__dirname, "public")));

// === Socket.io Setup ===
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://abona-faltaus.vercel.app",
      "https://exam-group.glitch.me",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// === In-Memory Room Store ===
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // === Create Room ===
  socket.on("create-room", ({ roomId }) => {
    if (rooms.has(roomId)) {
      socket.emit("room-error", "الغرفة موجودة بالفعل");
      return;
    }

    rooms.set(roomId, {
      teams: [],
      admin: socket.id,
      status: "waiting",
      questions: [],
      currentQuestionIndex: 0,
    });

    socket.join(roomId);
    console.log(`✅ [ROOM CREATED] ${roomId} by ${socket.id}`);
  });

  // === Join Room ===
  socket.on("join-room", ({ roomId, team, isAdmin }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("room-error", "الغرفة غير موجودة");
      return;
    }

    if (isAdmin) {
      if (room.admin === socket.id) {
        socket.join(roomId);
        socket.emit("room-joined", { isAdmin: true });

        if (room.status === "active" && room.questions.length > 0) {
          socket.emit("exam-started", {
            question: room.questions[room.currentQuestionIndex],
            timePerQuestion: room.timePerQuestion,
            totalQuestions: room.questions.length,
          });
        }
      }
      return;
    }

    const existingTeam = room.teams.find((t) => t.id === team.id);

    if (!existingTeam) {
      const newTeam = {
        id: team.id,
        name: team.name,
        socketId: socket.id,
        score: 0,
        memberCount: team.memberCount,
        members: team.members || [],
      };
      room.teams.push(newTeam);
      socket.join(roomId);
      socket.emit("room-joined", { team: newTeam });
      io.to(room.admin).emit("team-joined", newTeam);
      console.log(`✅ [JOIN] Team ${team.name} joined room ${roomId}`);
    } else {
      existingTeam.socketId = socket.id;
      socket.join(roomId);
      socket.emit("room-joined", { team: existingTeam });
      console.log(
        `🔁 [REJOIN] Team ${existingTeam.name} reconnected to room ${roomId}`
      );
    }
  });

  // === Start Exam ===
  socket.on("start-exam", ({ roomId, settings }) => {
    const room = rooms.get(roomId);
    if (!room || room.admin !== socket.id) return;

    const selectedCategories = settings.categories.filter(Boolean);
    if (selectedCategories.length === 0) {
      socket.emit("exam-error", "لم يتم اختيار أي تصنيفات");
      return;
    }

    let questionsData = [];
    try {
      const questionsPath = path.join(
        __dirname,
        "public",
        "exam",
        "simple.json"
      );
      questionsData = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
    } catch (err) {
      console.error("❌ Failed to load questions:", err);
      socket.emit("exam-error", "تعذر تحميل الأسئلة");
      return;
    }

    let allQuestions = [];
    selectedCategories.forEach((category) => {
      const catData = questionsData.find((cat) => cat.category === category);
      if (catData) {
        allQuestions = allQuestions.concat(catData.questions);
      }
    });

    const shuffled = allQuestions
      .sort(() => Math.random() - 0.5)
      .slice(0, settings.questionCount);

    room.questions = shuffled;
    room.currentQuestionIndex = 0;
    room.timePerQuestion = settings.timePerQuestion;
    room.status = "active";

    io.to(roomId).emit("exam-started", {
      question: shuffled[0],
      timePerQuestion: settings.timePerQuestion,
      totalQuestions: settings.questionCount,
    });

    console.log(`🚀 [START] Exam started in room ${roomId}`);
  });

  // === Submit Answer ===
  socket.on("submit-answer", ({ roomId, questionId, answer }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const question = room.questions.find((q) => q.id === questionId);
    const team = room.teams.find((t) => t.socketId === socket.id);

    if (!question || !team) return;

    const isCorrect = answer === question.correctAnswer;
    if (isCorrect) {
      team.score += 1;
    }

    socket.emit("answer-result", { correct: isCorrect });
    io.to(room.admin).emit("answer-submitted", {
      teamId: team.id,
      isCorrect,
    });

    console.log(
      `📩 [ANSWER] Team ${team.name} submitted: ${isCorrect ? "✅" : "❌"}`
    );
  });

  // === Next Question ===
  socket.on("next-question", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room || room.admin !== socket.id) return;

    room.currentQuestionIndex++;
    const hasMore = room.currentQuestionIndex < room.questions.length;

    if (hasMore) {
      const question = room.questions[room.currentQuestionIndex];
      io.to(roomId).emit("question", {
        question,
        index: room.currentQuestionIndex,
        total: room.questions.length,
      });
    } else {
      room.status = "finished";
      io.to(roomId).emit("exam-finished", {
        teams: room.teams,
      });
      console.log(`✅ [FINISH] Exam in room ${roomId}`);
    }
  });

  // === Handle Disconnect ===
  socket.on("disconnect", () => {
    for (const [roomId, room] of rooms.entries()) {
      // Check if admin left
      if (room.admin === socket.id) {
        io.to(roomId).emit("admin-left");
        rooms.delete(roomId);
        console.log(`❌ [ADMIN LEFT] Room ${roomId} closed`);
        break;
      }

      // Check if a team left
      const teamIndex = room.teams.findIndex((t) => t.socketId === socket.id);
      if (teamIndex !== -1) {
        const team = room.teams.splice(teamIndex, 1)[0];
        io.to(room.admin).emit("team-left", team.id);
        console.log(`👋 [LEAVE] Team ${team.name} left room ${roomId}`);
      }
    }
  });
});

// === Server Port ===
const port = process.env.PORT || 3001;
httpServer.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Socket server running on port ${port}`);
});
