"use client";

import { useDroppable } from "@dnd-kit/core";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { useDragStore } from "@/stores/drag-store";

interface DroppableSlotProps {
  id: string;
  date: Date;
  hour: number;
  minute: number;
  children?: React.ReactNode;
  className?: string;
}

export function DroppableSlot({
  id,
  date,
  hour,
  minute,
  children,
  className,
}: DroppableSlotProps) {
  const setHoverTarget = useDragStore((s) => s.setHoverTarget);

  const { isOver, setNodeRef } = useDroppable({
    id,
    data: { date, hour, minute },
  });

  useEffect(() => {
    if (isOver) {
      setHoverTarget({ date, hour, minute });
    }
  }, [isOver, date, hour, minute, setHoverTarget]);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative transition-colors duration-150",
        isOver && "bg-blue-500/10 ring-1 ring-inset ring-blue-400/30",
        className
      )}
    >
      {children}
    </div>
  );
}
