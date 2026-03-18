"use client";

import { useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { set, addMinutes, formatISO, parseISO } from "date-fns";
import { toast } from "sonner";

import { useDragStore } from "@/stores/drag-store";
import { useScheduleTask, useRescheduleEvent } from "@/hooks/use-events";
import { DragOverlayComponent } from "./drag-overlay";
import type { DragItem } from "@/types/calendar";

interface DndContextProviderProps {
  children: React.ReactNode;
}

function parseDroppableId(id: string): {
  date: string;
  hour: number;
  minute: number;
} | null {
  // Format: slot-{dateISO}-{hour}-{minute}
  const match = id.match(/^slot-(.+)-(\d+)-(\d+)$/);
  if (!match) return null;
  return {
    date: match[1],
    hour: parseInt(match[2], 10),
    minute: parseInt(match[3], 10),
  };
}

export function DndContextProvider({ children }: DndContextProviderProps) {
  const { setActiveItem, setHoverTarget, reset } = useDragStore();
  const scheduleTask = useScheduleTask();
  const rescheduleEvent = useRescheduleEvent();

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const keyboardSensor = useSensor(KeyboardSensor);

  const sensors = useSensors(pointerSensor, keyboardSensor);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const data = event.active.data.current as DragItem | undefined;
      if (data) {
        setActiveItem(data);
      }
    },
    [setActiveItem]
  );

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const overId = event.over?.id;
      if (!overId || typeof overId !== "string") {
        setHoverTarget(null);
        return;
      }

      const overData = event.over?.data.current;
      if (overData?.date && overData?.hour !== undefined) {
        setHoverTarget({
          date: overData.date,
          hour: overData.hour,
          minute: overData.minute ?? 0,
        });
      }
    },
    [setHoverTarget]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || typeof over.id !== "string") {
        reset();
        return;
      }

      const parsed = parseDroppableId(over.id as string);
      if (!parsed) {
        reset();
        return;
      }

      const dragData = active.data.current as DragItem | undefined;
      if (!dragData) {
        reset();
        return;
      }

      const targetDate = parseISO(parsed.date);
      const startTime = set(targetDate, {
        hours: parsed.hour,
        minutes: parsed.minute,
        seconds: 0,
        milliseconds: 0,
      });
      const durationMinutes = dragData.estimatedMinutes ?? 30;
      const endTime = addMinutes(startTime, durationMinutes);

      const startISO = formatISO(startTime);
      const endISO = formatISO(endTime);

      if (dragData.type === "task") {
        scheduleTask.mutate(
          {
            taskId: dragData.id,
            startTime: startISO,
            endTime: endISO,
          },
          {
            onSuccess: () => {
              toast.success("Task scheduled");
            },
            onError: (error) => {
              toast.error("Failed to schedule task", {
                description:
                  error instanceof Error ? error.message : "Unknown error",
              });
            },
          }
        );
      } else if (dragData.type === "event") {
        rescheduleEvent.mutate(
          {
            eventId: dragData.id,
            startTime: startISO,
            endTime: endISO,
          },
          {
            onSuccess: () => {
              toast.success("Event rescheduled");
            },
            onError: (error) => {
              toast.error("Failed to reschedule event", {
                description:
                  error instanceof Error ? error.message : "Unknown error",
              });
            },
          }
        );
      }

      reset();
    },
    [reset, scheduleTask, rescheduleEvent]
  );

  const handleDragCancel = useCallback(() => {
    reset();
  }, [reset]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlayComponent />
    </DndContext>
  );
}
