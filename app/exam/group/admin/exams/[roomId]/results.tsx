import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { socket } from "@/lib/socket";

interface Team {
  id: string;
  name: string;
  members?: string[];
  memberCount?: number;
  score: number;
}

export default function ResultsPage() {
    const params = useParams();
  const roomId = params?.roomId as string;
  const [teams, setTeams] = useState<Team[]>([]);
  useEffect(() => {
    // يمكنك جلب النتائج من الستيت المشترك بالسوكيت أو fetch من API
    socket.emit("get-results", { roomId }, (res: Team[]) => setTeams(
      res.sort((a, b) => b.score - a.score)
    ));
  }, [ roomId ]);

  return (
    <div className="text-center py-5">
      <h2 className="mb-4">🏆 نتائج الامتحان</h2>
      <div className="d-flex justify-content-center gap-4">
        {teams.map((team, idx) => (
          <div key={team.id} className="p-4 shadow rounded text-center" style={{ flex: "1" }}>
            <h3 className="h1">{idx + 1}</h3>
            <h4>{team.name}</h4>
            <p>الأعضاء: {team.members?.join(", ")}</p>
            <p>النتيجة: {team.score}</p>
          </div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-5">
        <Image src="/exam/celebration.gif" width={150} height={150} alt="احتفال" />
      </motion.div>
    </div>
  );
}

