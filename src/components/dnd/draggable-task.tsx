"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { DragItem } from "@/types/calendar";
import { useDragStore } from "@/stores/drag-store";

interface DraggableTaskProps {
  id: string;
  data: DragItem;
  children: React.ReactNode;
}

export function DraggableTask({ id, data, children }: DraggableTaskProps) {
  const setActiveItem = useDragStore((s) => s.setActiveItem);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id,
      data,
    });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : undefined,
    cursor: isDragging ? "grabbing" : "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-task-id={data.id}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  );
}
