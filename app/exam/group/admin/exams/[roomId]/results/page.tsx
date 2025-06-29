"use client";
import { useEffect, useState } from "react";
// import Image from "next/image";
import confetti from "canvas-confetti";

interface Team {
  id: string;
  name: string;
  members: string[];
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

  if (!teams.length) return <div className="container py-5 text-center">لا توجد نتائج بعد.</div>;

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
    <div className="container py-5">
      <h2 className="text-center mb-4">🏆 نتائج المسابقة</h2>

      <div className="row justify-content-center mb-5">
        {top3.map((team, i) => (
          <div key={team.id} className="col-md-4 text-center">
            <div className={`p-3 shadow rounded bg-${i === 0 ? "warning" : i === 1 ? "secondary" : "info"} text-white`}>
              <h4>{getPlaceText(i)}</h4>
              <h5 className="fw-bold">{team.name}</h5>
              <p>النقاط: {team.score}</p>
              <ul className="list-unstyled">
                {team.members.map((member, j) => (
                  <li key={j}>👤 {member}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="card shadow">
          <div className="card-header bg-light text-center fw-bold">الفرق الأخرى</div>
          <div className="card-body">
            {rest.map((team, i) => (
              <div key={team.id} className="d-flex justify-content-between border-bottom py-2">
                <div>
                  {getPlaceText(i + 3)} - <strong>{team.name}</strong>
                  <ul className="list-inline mb-0">
                    {team.members.map((m, idx) => (
                      <li className="list-inline-item small" key={idx}>👤 {m}</li>
                    ))}
                  </ul>
                </div>
                <div><span className="badge bg-primary">{team.score} نقطة</span></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
