"use client";

import { useMemo } from "react";
import { parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { DAY_START_DEFAULT, DAY_END_DEFAULT, HOUR_HEIGHT } from "@/lib/constants";
import { TimeSlot } from "./time-slot";
import { CalendarEvent } from "./calendar-event";
import { CurrentTimeIndicator } from "./current-time-indicator";
import type { WeekDay } from "@/types/calendar";
import type { ScheduledEvent } from "@/types/task";

interface DayColumnProps {
  day: WeekDay;
  events: ScheduledEvent[];
  dayStartHour?: number;
  dayEndHour?: number;
  onEventClick?: (event: ScheduledEvent) => void;
}

interface LayoutedEvent {
  event: ScheduledEvent;
  column: number;
  totalColumns: number;
}

function layoutOverlappingEvents(events: ScheduledEvent[]): LayoutedEvent[] {
  if (events.length === 0) return [];

  const sorted = [...events].sort((a, b) => {
    const aStart = parseISO(a.start_time).getTime();
    const bStart = parseISO(b.start_time).getTime();
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = parseISO(a.end_time).getTime();
    const bEnd = parseISO(b.end_time).getTime();
    return bEnd - aEnd;
  });

  const groups: ScheduledEvent[][] = [];
  let currentGroup: ScheduledEvent[] = [];
  let groupEnd = 0;

  for (const event of sorted) {
    const start = parseISO(event.start_time).getTime();
    const end = parseISO(event.end_time).getTime();

    if (currentGroup.length === 0 || start < groupEnd) {
      currentGroup.push(event);
      groupEnd = Math.max(groupEnd, end);
    } else {
      groups.push(currentGroup);
      currentGroup = [event];
      groupEnd = end;
    }
  }
  if (currentGroup.length > 0) {
    groups.push(currentGroup);
  }

  const result: LayoutedEvent[] = [];

  for (const group of groups) {
    const columns: ScheduledEvent[][] = [];

    for (const event of group) {
      const start = parseISO(event.start_time).getTime();
      let placed = false;

      for (let col = 0; col < columns.length; col++) {
        const lastInCol = columns[col][columns[col].length - 1];
        const lastEnd = parseISO(lastInCol.end_time).getTime();
        if (start >= lastEnd) {
          columns[col].push(event);
          placed = true;
          break;
        }
      }

      if (!placed) {
        columns.push([event]);
      }
    }

    const totalColumns = columns.length;
    for (let col = 0; col < columns.length; col++) {
      for (const event of columns[col]) {
        result.push({ event, column: col, totalColumns });
      }
    }
  }

  return result;
}

export function DayColumn({
  day,
  events,
  dayStartHour = DAY_START_DEFAULT,
  dayEndHour = DAY_END_DEFAULT,
  onEventClick,
}: DayColumnProps) {
  const slots = useMemo(() => {
    const s: { hour: number; minute: number }[] = [];
    for (let h = dayStartHour; h < dayEndHour; h++) {
      s.push({ hour: h, minute: 0 });
      s.push({ hour: h, minute: 30 });
    }
    return s;
  }, [dayStartHour, dayEndHour]);

  const layouted = useMemo(() => layoutOverlappingEvents(events), [events]);

  const totalHeight = (dayEndHour - dayStartHour) * HOUR_HEIGHT;

  return (
    <div
      className={cn(
        "flex-1 relative border-r border-border/40 last:border-r-0",
        day.isToday && "bg-primary/[0.03]"
      )}
      style={{ minHeight: totalHeight }}
    >
      {/* Time slot grid */}
      {slots.map((slot) => (
        <TimeSlot
          key={`${slot.hour}-${slot.minute}`}
          date={day.date}
          hour={slot.hour}
          minute={slot.minute}
        />
      ))}

      {/* Events layer */}
      {layouted.map(({ event, column, totalColumns }) => {
        const widthPercent = 100 / totalColumns;
        const leftPercent = column * widthPercent;

        return (
          <CalendarEvent
            key={event.id}
            event={event}
            dayStart={dayStartHour}
            onEventClick={onEventClick}
            style={{
              width: `calc(${widthPercent}% - 2px)`,
              left: `${leftPercent}%`,
            }}
          />
        );
      })}

      {/* Current time indicator for today */}
      {day.isToday && (
        <CurrentTimeIndicator
          dayStartHour={dayStartHour}
          dayEndHour={dayEndHour}
        />
      )}
    </div>
  );
}
