"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io, Socket } from "socket.io-client";
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function JoinPage() {
  const router = useRouter();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState("");
  const [showScanner, setShowScanner] = useState(false);
  const [memberCount, setMemberCount] = useState(1);
  const [members, setMembers] = useState<string[]>([""]);
  const [isConnecting, setIsConnecting] = useState(true);
  const scannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsConnecting(true);
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log("Connecting to socket server:", socketUrl);

    const newSocket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      timeout: 10000,
    });

    newSocket.on("connect", () => {
      console.log("Connected to socket server");
      setIsConnecting(false);
      setError("");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Connection error:", err);
      setError("خطأ في الاتصال بالخادم. يرجى المحاولة مرة أخرى");
      setIsConnecting(false);
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
        alert(`تم انضمام فريق ${data.team.name} بنجاح!`);
        router.push(`/exam/group/play/${roomId}`);
      });

      socket.on("room-error", (message: string) => {
        setError(message);
      });
    }
  }, [socket, roomId, router]);

  const startScanner = () => {
    if (scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        scannerRef.current.id,
        { fps: 10, qrbox: 250 },
        false
      );
      scanner.render(
        (decodedText: string) => {
          setRoomId(decodedText);
          scanner.clear();
          setShowScanner(false);
        },
        () => {
          setError("خطأ في قراءة QR");
        }
      );
    }
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
              {isConnecting && (
                <div className="alert alert-info" role="alert">
                  جاري الاتصال بالخادم...
                </div>
              )}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              <div className="mb-3 d-flex align-items-center gap-2">
                <label htmlFor="roomId" className="form-label mb-0">
                  رقم الغرفة
                </label>
                <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { setShowScanner(true); setTimeout(startScanner, 100); }}>
                  <span role="img" aria-label="scan">📷</span> QR
                </button>
              </div>
              {showScanner && (
                <div className="mb-3">
                  <div id="qr-reader" ref={scannerRef} className="w-100"></div>
                  <button type="button" className="btn btn-danger mt-2" onClick={() => setShowScanner(false)}>إغلاق</button>
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
