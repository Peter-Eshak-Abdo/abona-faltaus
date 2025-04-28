"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ExamSettings() {
  const router = useRouter();

  const [questionCount, setQuestionCount] = useState(10);
  const [groupCount, setGroupCount] = useState(1);
  const [timePerGroup, setTimePerGroup] = useState(10); // بالدقايق

  const startExam = () => {
    // إرسال جميع القيم التي يختارها المستخدم إلى صفحة الأسئلة
    router.push(`/exam/exam-settings/exam-groups?questions=${questionCount}&groups=${groupCount}&time=${timePerGroup}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">إعدادات الامتحان</h1>

      <div className="space-y-4 w-full max-w-md">
        <div>
          <label>عدد الأسئلة:</label>
          <input
            type="number"
            min="1"
            max="300"
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="border p-2 w-full rounded"
            title="عدد الأسئلة"
            placeholder="أدخل عدد الأسئلة"
          />
        </div>

        <div>
          <label>عدد المجموعات:</label>
          <input
            type="number"
            min="1"
            max="30"
            value={groupCount}
            onChange={(e) => setGroupCount(Number(e.target.value))}
            className="border p-2 w-full rounded"
            title="عدد المجموعات"
            placeholder="أدخل عدد المجموعات"
          />
        </div>

        <div>
          <label>الوقت لكل مجموعة (بالدقايق):</label>
          <input
            type="number"
            min="1"
            max="120"
            value={timePerGroup}
            onChange={(e) => setTimePerGroup(Number(e.target.value))}
            className="border p-2 w-full rounded"
            title="الوقت لكل مجموعة"
            placeholder="أدخل الوقت لكل مجموعة"
          />
        </div>

        <button
          onClick={startExam}
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
        >
          ابدأ الامتحان
        </button>
      </div>
    </div>
  );
}
