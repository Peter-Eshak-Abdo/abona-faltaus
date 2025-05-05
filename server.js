import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store active rooms and their teams
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Client connected:", socket.id);

  // Create a new room
  socket.on("create-room", ({ roomId }) => {
    rooms.set(roomId, {
      teams: [],
      admin: socket.id,
      status: "waiting", // waiting, active, finished
      questions: [], // Store questions for the room
      currentQuestionIndex: 0,
    });
    socket.join(roomId);
    console.log(`Room ${roomId} created by admin ${socket.id}`);
  });

  // Join a room
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
        // Send current question if exam has started
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

    // Check if team already exists by id (not socketId)
    const existingTeam = room.teams.find((t) => t.id === team.id);
    if (!existingTeam) {
      // Add team to room
      room.teams.push({
        id: team.id,
        name: team.name,
        socketId: socket.id,
        score: 0,
      });
      socket.join(roomId);
      socket.emit("room-joined", { team });
      io.to(room.admin).emit("team-joined", team);
      console.log(`Team ${team.name} joined room ${roomId}`);
    } else {
      // Team already exists, just update socket ID
      existingTeam.socketId = socket.id;
      socket.join(roomId);
      socket.emit("room-joined", { team: existingTeam });
      console.log(`Team ${existingTeam.name} reconnected to room ${roomId}`);
    }
  });

  // Start exam
  socket.on("start-exam", ({ roomId, settings }) => {
    const room = rooms.get(roomId);
    if (room && room.admin === socket.id) {
      room.status = "active";
      // Load questions from JSON file
      const questionsData = JSON.parse(
        fs.readFileSync(join(__dirname, "public/exam/simple.json"), "utf8")
      );
      let allQuestions = [];
      settings.categories.forEach((category) => {
        const categoryData = questionsData.find(
          (cat) => cat.category === category
        );
        if (categoryData) {
          allQuestions = allQuestions.concat(categoryData.questions);
        }
      });
      const shuffledQuestions = allQuestions
        .sort(() => Math.random() - 0.5)
        .slice(0, settings.questionCount);
      room.questions = shuffledQuestions;
      room.currentQuestionIndex = 0;
      room.timePerQuestion = settings.timePerQuestion;
      // Send first question to all teams
      io.to(roomId).emit("exam-started", {
        question: room.questions[0],
        timePerQuestion: settings.timePerQuestion,
        totalQuestions: settings.questionCount,
      });
      console.log(
        `Exam started in room ${roomId} with ${room.teams.length} teams. Sent exam-started event to all in room.`
      );
    }
  });

  // Handle team leaving
  socket.on("disconnect", () => {
    // Find and remove team from all rooms
    rooms.forEach((room, roomId) => {
      const teamIndex = room.teams.findIndex((t) => t.socketId === socket.id);
      if (teamIndex !== -1) {
        const team = room.teams[teamIndex];
        room.teams.splice(teamIndex, 1);
        io.to(room.admin).emit("team-left", team.id);
        console.log(`Team ${team.name} left room ${roomId}`);
      }
    });
  });

  // Next question
  socket.on("next-question", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room && room.admin === socket.id) {
      room.currentQuestionIndex++;
      if (room.currentQuestionIndex < room.questions.length) {
        const question = room.questions[room.currentQuestionIndex];
        io.to(roomId).emit("question", question);
      } else {
        // Exam finished
        room.status = "finished";
        io.to(roomId).emit("exam-finished", {
          teams: room.teams,
        });
      }
    }
  });

  // Submit answer
  socket.on("submit-answer", ({ roomId, questionId, answer }) => {
    const room = rooms.get(roomId);
    if (room) {
      const question = room.questions.find((q) => q.id === questionId);
      if (question) {
        const isCorrect = answer === question.correctAnswer;
        const team = room.teams.find((t) => t.socketId === socket.id);
        if (team) {
          if (isCorrect) {
            team.score += 1;
          }
          socket.emit("answer-result", { correct: isCorrect });
          io.to(room.admin).emit("answer-submitted", {
            teamId: team.id,
            isCorrect,
          });
        }
      }
    }
  });
});

// httpServer.listen(3001, () => {console.log("🚀 Socket server running on port 3001");});

const port = process.env.PORT || 3001;
httpServer.listen(port, () => {
  console.log(`🚀 Socket server running on port ${port}`);
});
