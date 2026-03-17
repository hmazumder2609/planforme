import { useMemo } from "react";
import {
  startOfWeek,
  endOfWeek,
  addWeeks,
  eachDayOfInterval,
  format,
  isToday,
  isWeekend,
} from "date-fns";
import { useUiStore } from "@/stores/ui-store";
import type { WeekDay } from "@/types/calendar";

export function useWeekNavigation() {
  const { weekOffset, goToPrevWeek, goToNextWeek, goToCurrentWeek, setWeekOffset } = useUiStore();

  const weekData = useMemo(() => {
    const baseDate = addWeeks(new Date(), weekOffset);
    const weekStart = startOfWeek(baseDate, { weekStartsOn: 1 }); // Monday
    const weekEnd = endOfWeek(baseDate, { weekStartsOn: 1 });

    const days: WeekDay[] = eachDayOfInterval({ start: weekStart, end: weekEnd }).map(
      (date) => ({
        date,
        dayName: format(date, "EEE"),
        dayNumber: date.getDate(),
        isToday: isToday(date),
        isWeekend: isWeekend(date),
      })
    );

    return {
      weekStart,
      weekEnd,
      days,
      label: `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`,
      isCurrentWeek: weekOffset === 0,
    };
  }, [weekOffset]);

  return {
    ...weekData,
    weekOffset,
    goToPrevWeek,
    goToNextWeek,
    goToCurrentWeek,
    setWeekOffset,
  };
}
