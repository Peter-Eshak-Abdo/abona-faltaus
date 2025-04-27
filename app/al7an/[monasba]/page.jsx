import Link from "next/link";
import al7anData from "@/public/al7an-all.json";

export default async function MonasbaPage({ params }) {
  const awaitedParams = await params;
  const { monasba } = awaitedParams;
  // const monasba = await params.monasba;
  const allAl7an = al7anData.find((item) => item[monasba])?.[monasba] || [];

  return (
    <div className="container mt-5">
      <h1>ألحان مناسبة: {monasba}</h1>
      <ul className="list-group">
        {allAl7an.map((l7n, idx) => (
          <li key={idx} className="list-group-item">
            <Link href={`/al7an/${monasba}/${encodeURIComponent(l7n.name)}`}>
              {l7n.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
