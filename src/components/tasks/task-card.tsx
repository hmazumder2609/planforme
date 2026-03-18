"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Clock,
  Calendar as CalendarIcon,
  Flag,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PRIORITY_LABELS } from "@/lib/constants";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { TaskPriorityBadge } from "./task-priority-badge";
import { useCompleteTask, useDeleteTask, useUpdateTask } from "@/hooks/use-tasks";
import { useUiStore } from "@/stores/ui-store";
import type { Task, TaskPriority } from "@/types/task";
import { toast } from "sonner";

interface TaskCardProps {
  task: Task;
  onEdit?: (task: Task) => void;
  draggable?: boolean;
}

function formatDueDate(dateStr: string): string {
  const date = parseISO(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, "MMM d");
}

export function TaskCard({ task, onEdit, draggable }: TaskCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const completeTask = useCompleteTask();
  const deleteTask = useDeleteTask();
  const updateTask = useUpdateTask();
  const openTaskForm = useUiStore((s) => s.openTaskForm);

  const isDone = task.status === "done";
  const isDuePast =
    task.due_date && !isDone && isPast(parseISO(task.due_date)) && !isToday(parseISO(task.due_date));

  function handleComplete() {
    if (isDone) return;
    completeTask.mutate(task.id, {
      onSuccess: () => toast.success("Task completed"),
      onError: () => toast.error("Failed to complete task"),
    });
  }

  function handleEdit() {
    if (onEdit) {
      onEdit(task);
    } else {
      openTaskForm(task.id);
    }
  }

  function handleDelete() {
    deleteTask.mutate(task.id, {
      onSuccess: () => toast.success("Task deleted"),
      onError: () => toast.error("Failed to delete task"),
    });
  }

  function handleSetPriority(priority: TaskPriority) {
    updateTask.mutate(
      { id: task.id, input: { priority } },
      {
        onSuccess: () => toast.success("Priority updated"),
        onError: () => toast.error("Failed to update priority"),
      }
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.15 } }}
      transition={{ duration: 0.2 }}
      className={cn(
        "group relative flex items-start gap-2.5 rounded-lg border border-transparent px-2.5 py-2 transition-colors",
        "hover:border-border hover:bg-muted/50",
        isDone && "opacity-60",
        draggable && "cursor-grab active:cursor-grabbing"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...(draggable ? { "data-task-id": task.id } : {})}
    >
      {/* Checkbox */}
      <div className="pt-0.5">
        <Checkbox
          checked={isDone}
          onCheckedChange={handleComplete}
          disabled={isDone || completeTask.isPending}
          className={cn(
            "size-4 rounded-full",
            isDone && "opacity-50"
          )}
        />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {/* Category color dot */}
          {task.category && (
            <span
              className="inline-block size-2 shrink-0 rounded-full"
              style={{ backgroundColor: task.category.color }}
              title={task.category.name}
            />
          )}

          {/* Title */}
          <span
            className={cn(
              "truncate text-sm font-medium",
              isDone && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </span>

          {/* Priority badge */}
          {!isDone && <TaskPriorityBadge priority={task.priority} />}
        </div>

        {/* Meta row */}
        <div className="mt-1 flex items-center gap-2.5 text-xs text-muted-foreground">
          {task.due_date && (
            <span
              className={cn(
                "flex items-center gap-1",
                isDuePast && "text-red-500"
              )}
            >
              <CalendarIcon className="size-3" />
              {formatDueDate(task.due_date)}
            </span>
          )}
          {task.estimated_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {task.estimated_minutes}m
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {isHovered && !isDone && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="flex shrink-0 items-center gap-0.5"
          >
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleEdit}
              aria-label="Edit task"
            >
              <Pencil className="size-3" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Task actions"
                  />
                }
              >
                <MoreHorizontal className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEdit}>
                  <Pencil className="size-3.5" />
                  Edit
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Flag className="size-3.5" />
                    Set Priority
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuLabel>Priority</DropdownMenuLabel>
                    <DropdownMenuRadioGroup
                      value={String(task.priority)}
                      onValueChange={(val) => handleSetPriority(Number(val) as TaskPriority)}
                    >
                      {([1, 2, 3, 4] as const).map((p) => (
                        <DropdownMenuRadioItem key={p} value={String(p)}>
                          {PRIORITY_LABELS[p]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleDelete}
                >
                  <Trash2 className="size-3.5" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
