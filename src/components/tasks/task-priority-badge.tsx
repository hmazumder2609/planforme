"use client";

import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, PRIORITY_BG_COLORS } from "@/lib/constants";
import type { TaskPriority } from "@/types/task";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
  className?: string;
}

export function TaskPriorityBadge({ priority, className }: TaskPriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none",
        PRIORITY_BG_COLORS[priority],
        className
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
