"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getWeekEvents,
  scheduleTask,
  rescheduleEvent,
  unscheduleEvent,
  createTimeBlock,
} from "@/actions/events";
import type { ScheduledEvent } from "@/types/task";
import type { CreateEventInput } from "@/lib/validators";

export function useWeekEventsQuery(weekStart: string, weekEnd: string) {
  return useQuery({
    queryKey: ["events", weekStart, weekEnd],
    queryFn: () => getWeekEvents(weekStart, weekEnd),
    enabled: !!weekStart && !!weekEnd,
  });
}

export function useScheduleTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      startTime,
      endTime,
    }: {
      taskId: string;
      startTime: string;
      endTime: string;
    }) => scheduleTask(taskId, startTime, endTime),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useRescheduleEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      eventId,
      startTime,
      endTime,
    }: {
      eventId: string;
      startTime: string;
      endTime: string;
    }) => rescheduleEvent(eventId, startTime, endTime),
    onMutate: async ({ eventId, startTime, endTime }) => {
      await queryClient.cancelQueries({ queryKey: ["events"] });
      const previousEvents = queryClient.getQueriesData({ queryKey: ["events"] });

      queryClient.setQueriesData(
        { queryKey: ["events"] },
        (old: ScheduledEvent[] | undefined) => {
          if (!old) return old;
          return old.map((event) =>
            event.id === eventId
              ? { ...event, start_time: startTime, end_time: endTime }
              : event
          );
        }
      );

      return { previousEvents };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousEvents) {
        context.previousEvents.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useUnscheduleEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (eventId: string) => unscheduleEvent(eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCreateTimeBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => createTimeBlock(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
