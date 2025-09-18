"use client";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface Team {
  id: string;
  name: string;
  memberCount?: number;
  members?: string[];
  socketId: string;
  score: number;
}

export default function ResultPage() {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const savedResults = localStorage.getItem("examGroupResults");
    if (savedResults) {
      const parsed = JSON.parse(savedResults) as Team[];
      const sorted = [...parsed].sort((a, b) => b.score - a.score);
      setTeams(sorted);
    }

    confetti({ particleCount: 150, spread: 120, origin: { y: 0.6 } });
  }, []);

  if (!teams.length) return <div className="py-5 text-center">لا توجد نتائج بعد.</div>;

  // ترتيب المراكز
  const top3 = teams.slice(0, 3);
  const rest = teams.slice(3);

  const getPlaceText = (index: number) => {
    if (index === 0) return "🥇 المركز الأول";
    if (index === 1) return "🥈 المركز الثاني";
    if (index === 2) return "🥉 المركز الثالث";
    return `المركز ${index + 1}`;
  };

  return (
    <div className="py-5">
      <h2 className="text-center mb-4">🏆 نتائج المسابقة</h2>

      <div className="flex justify-center mb-5 space-x-4">
        {top3.map((team, i) => (
          <div key={team.id} className="w-1/3 text-center">
            <Card className={`p-3 ${i === 0 ? "bg-yellow-500" : i === 1 ? "bg-gray-500" : "bg-blue-500"} text-white`}>
              <CardContent>
                <h4>{getPlaceText(i)}</h4>
                <h5 className="font-bold">{team.name}</h5>
                <p>النقاط: {team.score}</p>
                <ul className="list-none">
                  {team.members &&
                    team.members.map((member, j) => (
                      <li key={j}>👤 {member}</li>
                    ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <Card>
          <CardHeader className="bg-gray-100 text-center font-bold">الفرق الأخرى</CardHeader>
          <CardContent>
            {rest.map((team, i) => (
              <div key={team.id} className="flex justify-between border-b py-2">
                <div>
                  {getPlaceText(i + 3)} - <strong>{team.name}</strong>
                  <ul className="flex space-x-2 mb-0">
                    {team.members &&
                      team.members.map((m, idx) => (
                        <li className="text-sm" key={idx}>👤 {m}</li>
                      ))}
                  </ul>
                </div>
                <div><span className="bg-blue-500 text-white px-2 py-1 rounded">{team.score} نقطة</span></div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
