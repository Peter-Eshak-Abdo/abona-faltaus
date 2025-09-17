"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { socket } from "@/lib/socket";
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function JoinPage() {
  // const searchParams = useSearchParams();
  // const prefilledRoomId = searchParams.get("room");
  const router = useRouter();
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

    socket.on("room-joined", (data) => {
      console.log("[JOIN] room-joined event received", data);
      setTeamName(data.team.name);
      localStorage.setItem("currentTeam", JSON.stringify({
        id: data.team.id,
        name: data.team.name,
        memberCount: data.team.memberCount,
        members: data.team.members
      }));
      alert(`تم انضمام فريق ${data.team.name} بنجاح!`);
      router.push(`/exam/group/play/${roomId}`);
    });

    socket.on("room-error", (message: string) => {
      console.error("Room error:", message);
      setError(message);
    });

    return () => {
      socket.off("room-joined");
      socket.off("room-error");
    };
  }, [roomId, router]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const room = params.get("room");
    if (room) {
      setRoomId(room);
    }
  }, []);
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
    if (!teamName.trim()) return setError("من فضلك أدخل اسم الفريق");
    if (members.some(name => !name.trim())) return setError("يجب ملء أسماء جميع الأعضاء");

    let teamId = undefined;
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
      // if (room.teams.some(t => t.name === teamName)) {
      //     setError("اسم الفريق موجود بالفعل في هذه الغرفة");
      //     return;
      // }
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-5">
      <div className="flex justify-center">
        <div className="w-full md:w-1/2">
          <div className="bg-white shadow-lg rounded-lg">
            <div className="bg-blue-600 text-white text-center p-4">
              <h2 className="text-xl font-bold mb-0">انضم إلى غرفة الامتحان</h2>
            </div>
            <div className="p-4">
              {isConnecting && (
                <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                  جاري الاتصال بالخادم...
                </div>
              )}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div className="mb-3 flex items-center gap-2">
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-0">
                  رقم الغرفة
                </label>
                <button type="button" className="border border-gray-600 text-gray-600 hover:bg-gray-600 hover:text-white px-3 py-1 rounded text-sm" onClick={() => { setShowScanner(true); setTimeout(startScanner, 100); }}>
                  <span role="img" aria-label="scan">📷</span> QR
                </button>
              </div>
              {showScanner && (
                <div className="mb-3">
                  <div id="qr-reader" ref={scannerRef} className="w-full"></div>
                  <button type="button" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mt-2" onClick={() => setShowScanner(false)}>إغلاق</button>
                </div>
              )}
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-3"
                id="roomId"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="أدخل رقم الغرفة أو استخدم QR"
                title="رقم الغرفة"
                disabled={showScanner}
              />
              <div className="mb-3">
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                  اسم الفريق
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="أدخل اسم الفريق"
                  title="اسم الفريق"
                />
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700">عدد أعضاء الفريق</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={memberCount}
                  onChange={e => handleMemberCountChange(Number(e.target.value))}
                  placeholder="عدد أعضاء الفريق"
                  title="عدد أعضاء الفريق"
                />
              </div>
              {Array.from({ length: memberCount }).map((_, idx) => (
                <div className="mb-2" key={idx}>
                  <label className="block text-sm font-medium text-gray-700">اسم العضو {idx + 1}</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    value={members[idx] || ""}
                    onChange={e => setMembers(m => { const arr = [...m]; arr[idx] = e.target.value; return arr; })}
                    placeholder={`اسم العضو ${idx + 1}`}
                    title={`اسم العضو ${idx + 1}`}
                  />
                </div>
              ))}
              <div className="flex justify-between mt-4">
                <Link href="/exam" className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded">
                  رجوع
                </Link>
                <button
                  type="button"
                  onClick={handleJoinRoom}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
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
