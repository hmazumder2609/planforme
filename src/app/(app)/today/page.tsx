"use client";

import { useMemo } from "react";
import {
  format,
  startOfDay,
  endOfDay,
  parseISO,
  isToday,
  differenceInMinutes,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  ListTodo,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskList } from "@/components/tasks/task-list";
import { useTasksQuery } from "@/hooks/use-tasks";
import { useWeekEventsQuery } from "@/hooks/use-events";
import { cn } from "@/lib/utils";

export default function TodayPage() {
  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");
  const weekStart = format(startOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(today, { weekStartsOn: 1 }), "yyyy-MM-dd");

  const { data: allTasks } = useTasksQuery();
  const { data: weekEvents } = useWeekEventsQuery(weekStart, weekEnd);

  const todayEvents = useMemo(() => {
    if (!weekEvents) return [];
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);
    return weekEvents
      .filter((event) => {
        const eventStart = parseISO(event.start_time);
        return eventStart >= dayStart && eventStart <= dayEnd;
      })
      .sort(
        (a, b) =>
          parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
      );
  }, [weekEvents, today]);

  const stats = useMemo(() => {
    if (!allTasks) return { completed: 0, remaining: 0, scheduledHours: 0 };

    const todayTasks = allTasks.filter(
      (t) =>
        (t.due_date && t.due_date === todayStr) ||
        (t.completed_at && isToday(parseISO(t.completed_at)))
    );

    const completed = todayTasks.filter((t) => t.status === "done").length;
    const remaining = todayTasks.filter((t) => t.status !== "done").length;

    const scheduledMinutes = todayEvents.reduce((acc, event) => {
      return (
        acc +
        differenceInMinutes(parseISO(event.end_time), parseISO(event.start_time))
      );
    }, 0);

    return {
      completed,
      remaining,
      scheduledHours: Math.round((scheduledMinutes / 60) * 10) / 10,
    };
  }, [allTasks, todayEvents, todayStr]);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <h1 className="text-2xl font-bold">{format(today, "EEEE, MMMM d")}</h1>
        <p className="text-sm text-muted-foreground">Your focus for today</p>
      </div>

      <div className="grid grid-cols-3 gap-4 border-b px-6 py-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.completed}</p>
              <p className="text-xs text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
              <ListTodo className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.remaining}</p>
              <p className="text-xs text-muted-foreground">Remaining</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.scheduledHours}h</p>
              <p className="text-xs text-muted-foreground">Scheduled</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Today's schedule */}
        <div className="flex-1 overflow-y-auto border-r p-6">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Schedule</h2>
          </div>
          {todayEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No events scheduled for today
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {todayEvents.map((event) => {
                const start = parseISO(event.start_time);
                const end = parseISO(event.end_time);
                const durationMins = differenceInMinutes(end, start);

                return (
                  <div
                    key={event.id}
                    className={cn(
                      "rounded-lg border p-3 transition-colors hover:bg-accent/50",
                      event.task?.status === "done" && "opacity-50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{event.title}</p>
                      <span className="text-xs text-muted-foreground">
                        {durationMins}m
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(start, "h:mm a")} - {format(end, "h:mm a")}
                    </p>
                    {event.color && (
                      <div
                        className="mt-1 h-0.5 w-8 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's tasks */}
        <div className="w-[380px] overflow-y-auto p-6">
          <div className="mb-4 flex items-center gap-2">
            <ListTodo className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Tasks</h2>
          </div>
          <TaskList filters={{ due_date: todayStr }} />
        </div>
      </div>
    </div>
  );
}
