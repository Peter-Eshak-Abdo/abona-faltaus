"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { socket } from "@/lib/socket";

type Category = {
  name: string;
  count: number;
};

type Team = {
  id: string;
  name: string;
};

export default function ExamSettings() {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>("");
  const [showQR, setShowQR] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxQuestions, setMaxQuestions] = useState(0);

  useEffect(() => {
    if (socket) {
      socket.on("teams-init", setTeams);
      socket.on("team-joined", (team: Team) => {
        console.log("[JOIN] team-joined event received", team);
        setTeams(prev => [...prev, team]);
      });

      socket.on("team-left", (teamId: string) => {
        console.log("[LEAVE] team-left event received", teamId);
        setTeams(prev => prev.filter(team => team.id !== teamId));
      });
      socket.on("room-joined", (data: { team: Team }) => {
        console.log("[JOIN] room-joined event received", data);
        setTeams(prev => [...prev, data.team]);
      });
    }

    const loadCategories = async () => {
      try {
        const res = await fetch("/exam/simple.json");
        const data = await res.json();
        const loaded: Category[] = data.map((cat: { category: string; questions: { id: number; text: string }[] }): Category => ({
          name: cat.category,
          count: cat.questions.length,
        }));

        setCategories(loaded);
        setSelectedCategories([loaded[0]?.name]);
        setMaxQuestions(
          loaded.reduce((sum: number, cat: Category) => sum + cat.count, 0)
        );
      } catch (err) {
        console.error("خطأ في تحميل الفئات:", err);
      }
    };

    loadCategories();

    return () => {
      socket.off("teams-init", setTeams);
      socket.off("team-joined");
    };
  }, []);

  const handleCreateRoom = () => {
    const newRoomId = Math.random().toString(36).substring(2, 8);
    setRoomId(newRoomId);
    setShowQR(true);
    interface CreateRoomAck {
      success: boolean;
      error?: string;
    }

    socket?.emit(
      "create-room",
      { roomId: newRoomId },
      (ack: CreateRoomAck) => {
        if (ack.success) {
          router.push(`/exam/group/admin/exams/${newRoomId}`);
        } else {
          alert(ack.error);
        }
      }
    );
  };

  const handleStartExam = () => {
    const settings = {
      roomId,
      questionCount,
      timePerQuestion,
      categories: selectedCategories,
    };

    if (!settings.questionCount || !settings.timePerQuestion || !settings.categories?.length) {
      alert("الرجاء تعيين جميع الإعدادات المطلوبة");
      return;
    }

    localStorage.setItem("examGroupSettings", JSON.stringify(settings));
    socket?.emit("start-exam", { roomId, settings });
    router.push(`/exam/group/admin/exams/${roomId}`);
  };

  const handleCategoryToggle = (category: string): void => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(category)
        ? prev.filter((c: string) => c !== category)
        : [...prev, category]
    );
  };

  const calculateMaxForSelected = () => {
    if (selectedCategories.length === 0) return 0;
    return Math.min(
      categories
        .filter((cat) => selectedCategories.includes(cat.name))
        .reduce((sum, cat) => sum + cat.count, 0),
      maxQuestions
    );
  };

  const selectedMax = calculateMaxForSelected();

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-header bg-primary text-white text-center">
              <h2 className="h4 mb-0">إعدادات الامتحان</h2>
            </div>

            <div className="card-body">
              {!showQR ? (
                <button
                  type="button"
                  onClick={handleCreateRoom}
                  className="btn btn-primary w-100 mb-4"
                >
                  إنشاء غرفة الامتحان
                </button>
              ) : (
                <div className="text-center mb-4">
                  <QRCodeSVG value={roomId} size={200} />
                  <p className="mt-2">رقم الغرفة: {roomId}</p>
                  <p className="text-muted">عدد الفرق المتصلة: {teams.length}</p>
                </div>
              )}

              {/* اختيار الفئات */}
              <div className="mb-4">
                <h5 className="mb-3">اختر الفئات:</h5>
                <div className="d-flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      type="button"
                      key={cat.name}
                      onClick={() => handleCategoryToggle(cat.name)}
                      className={`btn btn-sm ${selectedCategories.includes(cat.name)
                        ? "btn-primary"
                        : "btn-outline-primary"
                        }`}
                    >
                      {cat.name} ({cat.count})
                    </button>
                  ))}
                </div>
              </div>

              {/* عدد الأسئلة */}
              <div className="mb-4">
                <label className="form-label">
                  عدد الأسئلة (الحد الأقصى: {selectedMax})
                </label>
                <input
                  type="range"
                  className="form-range"
                  min="1"
                  max={selectedMax}
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  title="عدد الأسئلة"
                />
                <div className="d-flex justify-content-between">
                  <span>1</span>
                  <span className="fw-bold">{questionCount}</span>
                  <span>{selectedMax}</span>
                </div>
              </div>

              {/* الوقت لكل سؤال */}
              <div className="mb-4">
                <label className="form-label">الوقت لكل سؤال (بالثواني):</label>
                <input
                  type="number"
                  min="10"
                  max="300"
                  value={timePerQuestion}
                  onChange={(e) => setTimePerQuestion(Number(e.target.value))}
                  className="form-control"
                  title="الوقت لكل سؤال"
                />
              </div>

              {/* الأزرار */}
              <div className="d-flex justify-content-between mt-4">
                <Link href="/exam" className="btn btn-secondary">
                  رجوع
                </Link>
                <button
                  type="button"
                  onClick={handleStartExam}
                  disabled={!showQR || selectedCategories.length === 0 || questionCount < 1 || teams.length === 0}
                  className="btn btn-primary"
                >
                  ابدأ الامتحان
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
