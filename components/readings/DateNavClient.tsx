"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

// Helper to format date to "yyyy-MM-dd"
const toISODateString = (date: Date) => {
  return format(date, "yyyy-MM-dd");
};

export default function DateNavClient({ serverDate, availableDates }: { serverDate: string; availableDates: string[] }) {
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date(serverDate));

  const goToDate = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
      const dateString = toISODateString(selectedDate);
      router.push(`/readings/${dateString}`);
    }
  };
  
  const goToDateString = (dateString: string) => {
    router.push(`/readings/${dateString}`);
  };

  return (
    <div className="flex flex-col items-center gap-4 my-4">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "w-[240px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>اختر تاريخ</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={goToDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <div className="flex gap-2 overflow-x-auto px-1 pb-2 w-full justify-center">
        {availableDates.slice(0, 30).map((d) => (
          <Button
            key={d}
            onClick={() => goToDateString(d)}
            variant={d === serverDate ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
          >
            {d}
          </Button>
        ))}
      </div>
    </div>
  );
}
