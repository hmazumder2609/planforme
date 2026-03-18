"use client";

import { useState, useEffect } from "react";
import { HOUR_HEIGHT, DAY_START_DEFAULT, DAY_END_DEFAULT } from "@/lib/constants";

interface CurrentTimeIndicatorProps {
  dayStartHour?: number;
  dayEndHour?: number;
}

export function CurrentTimeIndicator({
  dayStartHour = DAY_START_DEFAULT,
  dayEndHour = DAY_END_DEFAULT,
}: CurrentTimeIndicatorProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const timeInHours = currentHour + currentMinute / 60;

  if (timeInHours < dayStartHour || timeInHours >= dayEndHour) {
    return null;
  }

  const top = (timeInHours - dayStartHour) * HOUR_HEIGHT;

  return (
    <div
      className="absolute left-0 right-0 z-20 pointer-events-none"
      style={{ top }}
    >
      <div className="relative flex items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500 -ml-[5px] shrink-0" />
        <div className="flex-1 h-[2px] bg-red-500" />
      </div>
    </div>
  );
}
