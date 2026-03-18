"use client";

import { useRef, useEffect, useMemo } from "react";
import { format, isSameDay, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { HOUR_HEIGHT, DAY_START_DEFAULT, DAY_END_DEFAULT } from "@/lib/constants";
import { useWeekNavigation } from "@/hooks/use-week-navigation";
import { useWeekEventsQuery } from "@/hooks/use-events";
import { WeekHeader } from "./week-header";
import { TimeGutter } from "./time-gutter";
import { DayColumn } from "./day-column";
import type { ScheduledEvent } from "@/types/task";

interface WeeklyViewProps {
  dayStartHour?: number;
  dayEndHour?: number;
  onEventClick?: (event: ScheduledEvent) => void;
}

export function WeeklyView({
  dayStartHour = DAY_START_DEFAULT,
  dayEndHour = DAY_END_DEFAULT,
  onEventClick,
}: WeeklyViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { days, weekStart, weekEnd } = useWeekNavigation();

  const weekStartStr = format(weekStart, "yyyy-MM-dd");
  const weekEndStr = format(weekEnd, "yyyy-MM-dd");
  const { data: events, isLoading } = useWeekEventsQuery(weekStartStr, weekEndStr);

  // Auto-scroll to ~8AM on mount
  useEffect(() => {
    if (scrollRef.current) {
      const scrollTo8am = (8 - dayStartHour) * HOUR_HEIGHT;
      scrollRef.current.scrollTop = Math.max(0, scrollTo8am - 20);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const eventsByDay = useMemo(() => {
    if (!events) return new Map<string, ScheduledEvent[]>();

    const map = new Map<string, ScheduledEvent[]>();
    for (const day of days) {
      const key = format(day.date, "yyyy-MM-dd");
      map.set(key, []);
    }

    for (const event of events) {
      const eventDate = parseISO(event.start_time);
      for (const day of days) {
        if (isSameDay(eventDate, day.date)) {
          const key = format(day.date, "yyyy-MM-dd");
          map.get(key)!.push(event);
          break;
        }
      }
    }

    return map;
  }, [events, days]);

  return (
    <div className="h-full flex flex-col">
      <WeekHeader days={days} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        {isLoading ? (
          <LoadingSkeleton
            dayStartHour={dayStartHour}
            dayEndHour={dayEndHour}
          />
        ) : (
          <div className="flex">
            <TimeGutter
              dayStartHour={dayStartHour}
              dayEndHour={dayEndHour}
            />

            <div className="flex flex-1">
              {days.map((day) => {
                const key = format(day.date, "yyyy-MM-dd");
                const dayEvents = eventsByDay.get(key) || [];

                return (
                  <DayColumn
                    key={key}
                    day={day}
                    events={dayEvents}
                    dayStartHour={dayStartHour}
                    dayEndHour={dayEndHour}
                    onEventClick={onEventClick}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSkeleton({
  dayStartHour,
  dayEndHour,
}: {
  dayStartHour: number;
  dayEndHour: number;
}) {
  const totalHeight = (dayEndHour - dayStartHour) * HOUR_HEIGHT;

  return (
    <div className="flex animate-pulse">
      {/* Time gutter skeleton */}
      <div className="w-[60px] flex-shrink-0">
        {Array.from({ length: dayEndHour - dayStartHour }).map((_, i) => (
          <div key={i} className="relative" style={{ height: HOUR_HEIGHT }}>
            <div className="absolute -top-2 right-2 w-8 h-3 bg-muted rounded" />
          </div>
        ))}
      </div>

      {/* Day columns skeleton */}
      <div className="flex flex-1">
        {Array.from({ length: 7 }).map((_, dayIndex) => (
          <div
            key={dayIndex}
            className="flex-1 border-r border-border/40 last:border-r-0 relative"
            style={{ minHeight: totalHeight }}
          >
            {/* Fake slot lines */}
            {Array.from({ length: (dayEndHour - dayStartHour) * 2 }).map(
              (_, slotIndex) => (
                <div
                  key={slotIndex}
                  className="border-b border-border/40"
                  style={{ height: 30 }}
                />
              )
            )}

            {/* Fake events */}
            {dayIndex % 2 === 0 && (
              <div
                className="absolute left-1 right-1 rounded-md bg-muted"
                style={{
                  top: (2 + dayIndex) * HOUR_HEIGHT,
                  height: HOUR_HEIGHT * 1.5,
                }}
              />
            )}
            {dayIndex % 3 === 1 && (
              <div
                className="absolute left-1 right-1 rounded-md bg-muted"
                style={{
                  top: (5 + dayIndex) * HOUR_HEIGHT,
                  height: HOUR_HEIGHT,
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
