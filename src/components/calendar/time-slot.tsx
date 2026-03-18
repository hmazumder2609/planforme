"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SLOT_HEIGHT } from "@/lib/constants";
import { useDragStore } from "@/stores/drag-store";
import type { ReactNode } from "react";

interface TimeSlotProps {
  date: Date;
  hour: number;
  minute: number;
  children?: ReactNode;
}

export function TimeSlot({ date, hour, minute, children }: TimeSlotProps) {
  const { isDragging, hoverTarget } = useDragStore();

  const dateStr = format(date, "yyyy-MM-dd");
  const isHovered =
    isDragging &&
    hoverTarget &&
    format(hoverTarget.date, "yyyy-MM-dd") === dateStr &&
    hoverTarget.hour === hour &&
    hoverTarget.minute === minute;

  return (
    <div
      className={cn(
        "border-b border-border/40 relative",
        minute === 0 && "border-b-border/70",
        isHovered && "bg-primary/10"
      )}
      style={{ height: SLOT_HEIGHT }}
      data-date={dateStr}
      data-hour={hour}
      data-minute={minute}
      data-slot-id={`${dateStr}-${hour}-${minute}`}
    >
      {children}
    </div>
  );
}
