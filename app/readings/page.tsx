import Link from "next/link";
import { loadTodayReading, listAvailableDates } from "@/lib/readings";
import DateNavClient from "@/components/readings/DateNavClient";
import ReadingViewer from "@/components/readings/ReadingViewer";

export default async function ReadingsIndexPage() {
  const { date, reading } = await loadTodayReading();
  const dates = await listAvailableDates();

  return (
    <div className="mx-auto max-w-8xl p-1">
      <h1 className="text-2xl font-bold mb-1 text-center">قراءات اليوم</h1>

      <div className="mb-1">
        {/* DateNavClient هو مكوّن عميل للتنقل السريع */}
        <DateNavClient serverDate={date} availableDates={dates.slice().reverse()} />
      </div>

      <div className="mb-1">
        {reading ? (
          <ReadingViewer key={date} date={date} reading={reading} />
        ) : (
          <div className="p-1 border rounded text-center text-gray-600">
            لم يتم العثور على قراءة لليوم ({date}). جرّب اختيار يوم آخر من الأعلى.
            <div className="mt-1"><Link href="/readings" className="text-blue-600 underline">تحديث القائمة</Link></div>
          </div>
        )}
      </div>
    </div>
  );
}
