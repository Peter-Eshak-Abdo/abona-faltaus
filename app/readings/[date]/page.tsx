import { notFound } from "next/navigation";
import ReadingViewer from "@/components/readings/ReadingViewer";
import { loadReadingByDate } from "@/lib/readings";

type Props = { params: { date: string } };

export default async function DatePage({ params }: Props) {
  const { date } = params;
  const reading = await loadReadingByDate(date);
  if (!reading) return notFound();

  return (
    <div className="mx-auto max-w-8xl p-1">
      <ReadingViewer date={date} reading={reading} />
    </div>
  );
}
