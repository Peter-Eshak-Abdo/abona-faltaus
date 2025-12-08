import { notFound } from "next/navigation";
import KholagiClientViewer from "@/components/kholagi/KholagiClientViewer";
import { loadKholagiItem } from "@/lib/kholagi";

type Props = { params: { slug: string; chapter: string; } };

export default async function ChapterPage({ params }: Props) {
  const { slug, chapter } = params;
  const item = await loadKholagiItem(slug);
  if (!item) return notFound();

  const chNum = parseInt(chapter, 10);
  if (isNaN(chNum) || chNum < 1 || chNum > item.chapters.length) return notFound();

  const chapterText = item.chapters[chNum - 1];
  // Convert chapterText to array of lines for per-line interaction:
  let lines: string[] = [];
  if (typeof chapterText === "string") {
    // split on newlines or paragraphs
    lines = chapterText.split(/\r?\n\r?\n/).flatMap(p => p.split(/\r?\n/)).filter(Boolean).map(s => s.trim());
  } else if (Array.isArray(chapterText)) {
    lines = (chapterText as any[]).map((t: any) => (typeof t === "string" ? t : JSON.stringify(t)));
  } else {
    lines = [JSON.stringify(chapterText)];
  }

  return (
    <div className="mx-auto max-w-8xl p-1">
      <KholagiClientViewer
        slug={slug}
        title={item.title || slug}
        chapter={chNum}
        chaptersCount={item.chapters.length}
        lines={lines}
      />
    </div>
  );
}
