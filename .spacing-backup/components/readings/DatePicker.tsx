"use client";

import Link from "next/link";
import { useState } from "react";

type DatePickerProps = {
  date: string;
  dates: string[];
};

export default function DatePicker({ date, dates }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState(date);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const handleGo = () => {
    window.location.href = `/readings/${selectedDate}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-4">
      <form onSubmit={(e) => { e.preventDefault(); handleGo(); }} className="flex gap-4 items-center">
        <input
          type="date"
          title="date"
          value={selectedDate}
          onChange={handleDateChange}
          className="border p-4 rounded"
        />
        <button type="submit" className="p-4 bg-blue-600 text-white rounded">اذهب</button>
      </form>

      <div className="text-sm text-muted-foreground">أو اختر من الأيام المتاحة:</div>
      <div className="flex gap-4 overflow-x-auto">
        {dates.slice(-14).reverse().map(d => (
          <Link key={d} href={`/readings/${d}`} className={`p-1 rounded ${d === date ? "bg-blue-600 text-white" : "border"}`}>
            {d}
          </Link>
        ))}
      </div>
    </div>
  );
}
