"use client";

import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { HOUR_HEIGHT, PRIORITY_BG_COLORS } from "@/lib/constants";
import type { ScheduledEvent } from "@/types/task";

interface CalendarEventProps {
  event: ScheduledEvent;
  dayStart: number;
  onEventClick?: (event: ScheduledEvent) => void;
  style?: React.CSSProperties;
}

export function CalendarEvent({
  event,
  dayStart,
  onEventClick,
  style,
}: CalendarEventProps) {
  const { top, height, startLabel, endLabel } = useMemo(() => {
    const start = parseISO(event.start_time);
    const end = parseISO(event.end_time);

    const startHour = start.getHours();
    const startMinute = start.getMinutes();
    const endHour = end.getHours();
    const endMinute = end.getMinutes();

    const topPx =
      (startHour - dayStart) * HOUR_HEIGHT +
      (startMinute / 60) * HOUR_HEIGHT;

    const durationHours =
      endHour + endMinute / 60 - (startHour + startMinute / 60);
    const heightPx = Math.max(durationHours * HOUR_HEIGHT, 30);

    return {
      top: topPx,
      height: heightPx,
      startLabel: format(start, "h:mm a"),
      endLabel: format(end, "h:mm a"),
    };
  }, [event.start_time, event.end_time, dayStart]);

  const bgColor = event.color || "#3b82f6";
  const isSmall = height < 45;

  return (
    <div
      className={cn(
        "absolute left-0.5 right-0.5 rounded-md shadow-sm cursor-pointer",
        "border border-black/5 overflow-hidden transition-shadow hover:shadow-md",
        "group"
      )}
      style={{
        top,
        height,
        backgroundColor: `${bgColor}22`,
        borderLeftColor: bgColor,
        borderLeftWidth: 3,
        ...style,
      }}
      data-event-id={event.id}
      onClick={(e) => {
        e.stopPropagation();
        onEventClick?.(event);
      }}
    >
      <div className="px-1.5 py-0.5 h-full overflow-hidden">
        <div
          className={cn(
            "font-medium text-xs leading-tight truncate",
            isSmall ? "text-[10px]" : "text-xs"
          )}
          style={{ color: bgColor }}
        >
          {event.title}
        </div>

        {!isSmall && (
          <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
            {startLabel} - {endLabel}
          </div>
        )}

        {!isSmall && event.task?.priority && (
          <span
            className={cn(
              "inline-block text-[9px] font-medium px-1 py-0.5 rounded mt-0.5",
              PRIORITY_BG_COLORS[event.task.priority]
            )}
          >
            P{event.task.priority}
          </span>
        )}
      </div>
    </div>
  );
}
