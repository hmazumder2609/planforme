"use client";

import { cn } from "@/lib/utils";
import { PRIORITY_LABELS, STATUS_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { TaskPriority, TaskStatus } from "@/types/task";

export interface TaskFilters {
  status: TaskStatus | "all";
  priority: TaskPriority | "all";
}

interface TaskFiltersProps {
  filters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  className?: string;
}

const statusOptions: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Statuses" },
  { value: "todo", label: STATUS_LABELS.todo },
  { value: "in_progress", label: STATUS_LABELS.in_progress },
  { value: "done", label: STATUS_LABELS.done },
];

const priorityOptions: Array<{ value: string; label: string }> = [
  { value: "all", label: "All Priorities" },
  { value: "1", label: PRIORITY_LABELS[1] },
  { value: "2", label: PRIORITY_LABELS[2] },
  { value: "3", label: PRIORITY_LABELS[3] },
  { value: "4", label: PRIORITY_LABELS[4] },
];

function getActiveFilterCount(filters: TaskFilters): number {
  let count = 0;
  if (filters.status !== "all") count++;
  if (filters.priority !== "all") count++;
  return count;
}

export function TaskFilters({ filters, onFiltersChange, className }: TaskFiltersProps) {
  const activeCount = getActiveFilterCount(filters);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={filters.status}
        onValueChange={(val) =>
          onFiltersChange({ ...filters, status: val as TaskFilters["status"] })
        }
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority === "all" ? "all" : String(filters.priority)}
        onValueChange={(val) => {
          const parsed = val === "all" ? "all" : (Number(val) as TaskPriority);
          onFiltersChange({ ...filters, priority: parsed });
        }}
      >
        <SelectTrigger size="sm">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {activeCount > 0 && (
        <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
          {activeCount} active
        </Badge>
      )}
    </div>
  );
}
