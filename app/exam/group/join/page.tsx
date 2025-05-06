"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";

export default function JoinPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Force using localhost for development
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("خطأ في الاتصال بالخادم");
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("room-joined", (data) => {
        console.log("[JOIN] room-joined event received", data);
        // Save team info to localStorage
        localStorage.setItem("currentTeam", JSON.stringify(data.team));
        router.push(`/exam/group/play/${roomId}`);
      });

      socket.on("room-error", (message: string) => {
        setError(message);
      });
    }
  }, [socket, roomId, router]);

  const handleJoinRoom = () => {
    if (!roomId || !teamName) {
      setError("الرجاء إدخال رقم الغرفة واسم الفريق");
      return;
    }

    let teamId = undefined;
    // Try to reuse team id for the same team name
    const savedTeam = localStorage.getItem("currentTeam");
    if (savedTeam) {
      const team = JSON.parse(savedTeam);
      if (team.name === teamName && team.id) {
        teamId = team.id;
      }
    }
    if (!teamId) {
      teamId = Math.random().toString(36).substring(2, 10);
    }

    if (socket) {
      socket.emit("join-room", {
        roomId,
        team: {
          id: teamId,
          name: teamName
        }
      });
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">انضم إلى غرفة الامتحان</h2>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label htmlFor="roomId" className="form-label">
                  رقم الغرفة
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="أدخل رقم الغرفة"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="teamName" className="form-label">
                  اسم الفريق
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="أدخل اسم الفريق"
                />
              </div>
              <div className="d-flex justify-content-between mt-4">
                <Link href="/exam" className="btn btn-secondary">
                  رجوع
                </Link>
                <button
                  onClick={handleJoinRoom}
                  className="btn btn-primary"
                  disabled={!roomId || !teamName || !socket}
                >
                  انضم إلى الغرفة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
