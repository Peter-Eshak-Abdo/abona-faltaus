import Link from "next/link";
import { loadAllKholagiItems } from "@/lib/kholagi";

export default async function KholagiIndexPage() {
  const items = await loadAllKholagiItems();

  return (
    <div className="mx-auto max-w-8xl p-1">
      <h1 className="text-2xl font-bold mb-1 text-center">الخولاجي — المكتبة</h1>
      <p className="mb-1 text-center text-sm text-muted-foreground">مصدر: coptish-datastore (data/coptish-datastore/output)</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1">
        {items.map((it) => (
          <Link key={it.slug} href={`/kholagi/${it.slug}/1`} className="block p-1 border rounded-lg hover:shadow-md transition">
            <div className="font-semibold text-lg">{it.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{it.chapters.length} فصل</div>
            <div className="mt-1 text-xs text-gray-600 line-clamp-3">{typeof it.raw === "object" ? JSON.stringify(it.raw).slice(0, 160) : String(it.raw).slice(0, 160)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
