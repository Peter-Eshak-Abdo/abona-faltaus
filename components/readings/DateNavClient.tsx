"use client";
import React from "react";
import { useRouter } from "next/navigation";

export default function DateNavClient({ serverDate, availableDates }: { serverDate: string; availableDates: string[] }) {
  const router = useRouter();

  const goTo = (d: string) => {
    router.push(`/readings/${d}`);
  };

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-1 justify-center">
        <input
          type="date"
          defaultValue={serverDate}
          onChange={(e) => e.target.value && goTo(e.target.value)}
          className="border rounded p-1"
          aria-label="اختر تاريخ"
        />
        <button onClick={() => goTo(serverDate)} className="p-1 bg-blue-600 text-white rounded">اذهب</button>
      </div>

      <div className="flex gap-1 overflow-x-auto px-1">
        {availableDates.length === 0 ? (
          <div className="text-sm text-gray-500">لا توجد تواريخ متاحة</div>
        ) : (
          availableDates.slice(0, 30).map((d) => (
            <button
              key={d}
              onClick={() => goTo(d)}
              className={`p-1 rounded whitespace-nowrap ${d === serverDate ? "bg-blue-600 text-white" : "border"}`}
            >
              {d}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
