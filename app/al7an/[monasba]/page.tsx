import slugify from "slugify";
import al7anData from "@/public/al7an-all.json";
import Link from "next/link";
import { Metadata } from "next";

type Hymn = { monasba: string; name: string; [key: string]: unknown };
type Al7anData = { [key: string]: Hymn[] | undefined }[];
const typedAl7anData = al7anData as unknown as Al7anData;

export async function generateStaticParams() {
  return typedAl7anData.flatMap((col) =>
    Object.entries(col).map(([monasba]) => ({ monasba }))
  );
}

export async function generateMetadata({ params }: { params: Promise<{ monasba: string }> }): Promise<Metadata> {
  const { monasba } = await params;

  return {
    title: `ألحان مناسبة ${monasba}`, description: `ألحان ${monasba}` };
}

export default async function MonasbaPage({ params }: { params: Promise<{ monasba: string }> }) {
  const { monasba } = await params;
  const hymns = typedAl7anData.find((c) => c[monasba])?.[monasba] || [];
  return (
    <div className="max-w-7xl mx-auto mt-5">
      <h1>ألحان مناسبة {monasba}</h1>
      <ul className="space-y-2">
        {hymns.map((h) => {
          const slug = slugify(h.name, { lower: true, strict: true });
          return (
            <li key={slug} className="p-2 bg-white rounded shadow">
              <Link href={`/al7an/${monasba}/${slug}`}>{h.name}</Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
