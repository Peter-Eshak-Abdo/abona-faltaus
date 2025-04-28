"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function ResultPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const groupsParam = searchParams.get("groups");
  const groups = groupsParam ? JSON.parse(groupsParam) as number[] : [];

  const totalScore = groups.reduce((acc, val) => acc + val, 0);
  const totalQuestions = groups.length * (groups[0] ?? 10); // لو كل مجموعة 10 أسئلة مثلا

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">نتيجة الامتحان ✨</h1>

      <div className="space-y-6 w-full max-w-md">
        {groups.map((score, index) => (
          <div key={index} className="p-4 border rounded shadow">
            <h2 className="text-xl font-semibold mb-2">المجموعة {index + 1}</h2>
            <p>النتيجة: {score} من {groups[0]}</p>
          </div>
        ))}

        <div className="mt-8 p-6 border-2 rounded-lg shadow-lg bg-green-100">
          <h2 className="text-2xl font-bold text-center">النتيجة النهائية</h2>
          <p className="text-center text-xl mt-4">{totalScore} من {totalQuestions}</p>
        </div>

        <button
          onClick={() => router.push("/exam-settings")}
          className="mt-8 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 w-full"
        >
          اعادة الامتحان
        </button>
      </div>
    </div>
  );
}
