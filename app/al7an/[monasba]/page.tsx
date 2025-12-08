import al7anData from "@/public/al7an-all.json";
import { Metadata } from "next";
import { Suspense } from "react";
import MonasbaListClient from "./MonasbaListClient";

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
    <main className="max-w-8xl mx-auto p-1">
      <div className="mb-1">
        <h1 className="text-2xl font-bold">ألحان مناسبة {monasba}</h1>
        <p className="text-sm text-muted-foreground">عدد الألحان: {hymns.length}</p>
      </div>

      <Suspense fallback={<p>جاري التحميل...</p>}>
        <MonasbaListClient hymns={hymns} monasba={monasba} />
      </Suspense>
    </main>
  );
}
