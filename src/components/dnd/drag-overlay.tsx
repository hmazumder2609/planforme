"use client";

import { DragOverlay as DndKitDragOverlay } from "@dnd-kit/core";
import { useDragStore } from "@/stores/drag-store";

export function DragOverlayComponent() {
  const activeItem = useDragStore((s) => s.activeItem);

  return (
    <DndKitDragOverlay dropAnimation={null}>
      {activeItem ? (
        <div
          className="pointer-events-none w-56 rounded-lg border bg-background/90 px-3 py-2 text-sm font-medium shadow-xl backdrop-blur-sm"
          style={{
            transform: "rotate(2deg) scale(1.05)",
            opacity: 0.9,
          }}
        >
          <div className="flex items-center gap-2">
            {activeItem.color && (
              <span
                className="inline-block size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: activeItem.color }}
              />
            )}
            <span className="truncate">{activeItem.title}</span>
          </div>
          {activeItem.estimatedMinutes && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {activeItem.estimatedMinutes}min
            </p>
          )}
        </div>
      ) : null}
    </DndKitDragOverlay>
  );
}
