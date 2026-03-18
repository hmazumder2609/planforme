"use client";

import { HOUR_HEIGHT, DAY_START_DEFAULT, DAY_END_DEFAULT } from "@/lib/constants";

interface TimeGutterProps {
  dayStartHour?: number;
  dayEndHour?: number;
}

export function TimeGutter({
  dayStartHour = DAY_START_DEFAULT,
  dayEndHour = DAY_END_DEFAULT,
}: TimeGutterProps) {
  const hours: number[] = [];
  for (let h = dayStartHour; h < dayEndHour; h++) {
    hours.push(h);
  }

  return (
    <div className="w-[60px] flex-shrink-0 relative">
      {hours.map((hour) => {
        const label =
          hour === 0
            ? "12 AM"
            : hour < 12
              ? `${hour} AM`
              : hour === 12
                ? "12 PM"
                : `${hour - 12} PM`;

        return (
          <div
            key={hour}
            className="relative"
            style={{ height: HOUR_HEIGHT }}
          >
            <span className="absolute -top-3 right-2 text-xs text-muted-foreground select-none">
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
