"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import QrReader from 'react-qr-scanner';

export default function JoinPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [members, setMembers] = useState<string[]>([""]);

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

  const handleScan = (data: any) => {
    if (data && data.text) {
      setRoomId(data.text);
      setShowScanner(false);
    }
  };
  const handleError = (err: any) => {
    setError("خطأ في قراءة QR: " + err?.message);
    setShowScanner(false);
  };

  const handleMemberCountChange = (count: number) => {
    setMemberCount(count);
    setMembers((prev) => {
      const arr = [...prev];
      while (arr.length < count) arr.push("");
      while (arr.length > count) arr.pop();
      return arr;
    });
  };

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
          name: teamName,
          memberCount,
          members
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
              <div className="mb-3 d-flex align-items-center gap-2">
                <label htmlFor="roomId" className="form-label mb-0">
                  رقم الغرفة
                </label>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => setShowScanner(true)}>
                  <span role="img" aria-label="scan">📷</span> QR
                </button>
              </div>
              {showScanner && (
                <div className="mb-3">
                  <QrReader
                    delay={300}
                    onError={handleError}
                    onScan={handleScan}
                    style={{ width: '100%' }}
                  />
                  <button className="btn btn-danger mt-2" onClick={() => setShowScanner(false)}>إغلاق</button>
                </div>
              )}
              <input
                type="text"
                className="form-control mb-3"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="أدخل رقم الغرفة أو استخدم QR"
                title="رقم الغرفة"
                disabled={showScanner}
              />
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
                  title="اسم الفريق"
                />
              </div>
              <div className="mb-3">
                <label className="form-label">عدد أعضاء الفريق</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="form-control"
                  value={memberCount}
                  onChange={e => handleMemberCountChange(Number(e.target.value))}
                  placeholder="عدد أعضاء الفريق"
                  title="عدد أعضاء الفريق"
                />
              </div>
              {Array.from({ length: memberCount }).map((_, idx) => (
                <div className="mb-2" key={idx}>
                  <label className="form-label">اسم العضو {idx + 1}</label>
                  <input
                    type="text"
                    className="form-control"
                    value={members[idx] || ""}
                    onChange={e => setMembers(m => { const arr = [...m]; arr[idx] = e.target.value; return arr; })}
                    placeholder={`اسم العضو ${idx + 1}`}
                    title={`اسم العضو ${idx + 1}`}
                  />
                </div>
              ))}
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
