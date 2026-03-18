"use client";

import { cn } from "@/lib/utils";
import type { WeekDay } from "@/types/calendar";

interface WeekHeaderProps {
  days: WeekDay[];
}

export function WeekHeader({ days }: WeekHeaderProps) {
  return (
    <div className="flex border-b border-border sticky top-0 bg-background z-10">
      {/* Spacer matching time gutter width */}
      <div className="w-[60px] flex-shrink-0" />

      {days.map((day) => (
        <div
          key={day.date.toISOString()}
          className={cn(
            "flex-1 text-center py-2 select-none",
            day.isWeekend && "text-muted-foreground"
          )}
        >
          <div
            className={cn(
              "text-xs font-medium uppercase tracking-wide",
              day.isToday ? "text-primary" : "text-muted-foreground"
            )}
          >
            {day.dayName}
          </div>
          <div
            className={cn(
              "text-lg font-semibold mt-0.5 inline-flex items-center justify-center w-8 h-8 rounded-full",
              day.isToday && "bg-primary text-primary-foreground"
            )}
          >
            {day.dayNumber}
          </div>
        </div>
      ))}
    </div>
  );
}
