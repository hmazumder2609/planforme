"use client";

import { useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Inbox, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TaskCard } from "./task-card";
import { TaskFilters, type TaskFilters as TaskFiltersType } from "./task-filters";
import { InlineTaskInput } from "./inline-task-input";
import { Button } from "@/components/ui/button";
import { useTasksQuery } from "@/hooks/use-tasks";
import type { Task } from "@/types/task";

interface TaskListBaseProps {
  emptyMessage?: string;
  showFilters?: boolean;
  draggable?: boolean;
  className?: string;
}

interface TaskListWithTasks extends TaskListBaseProps {
  tasks: Task[];
  filters?: never;
}

interface TaskListWithFilters extends TaskListBaseProps {
  tasks?: never;
  filters?: {
    status?: string;
    priority?: number;
    category_id?: string;
    is_scheduled?: boolean;
    due_date?: string;
  };
}

type TaskListProps = TaskListWithTasks | TaskListWithFilters;

export function TaskList({
  tasks: tasksProp,
  filters: queryFilters,
  emptyMessage = "No tasks yet",
  showFilters = false,
  draggable = false,
  className,
}: TaskListProps) {
  const { data: fetchedTasks } = useTasksQuery(
    tasksProp ? undefined : queryFilters
  );

  const allTasks = tasksProp ?? fetchedTasks ?? [];

  const [localFilters, setLocalFilters] = useState<TaskFiltersType>({
    status: "all",
    priority: "all",
  });
  const [showCompleted, setShowCompleted] = useState(false);

  const { activeTasks, completedTasks } = useMemo(() => {
    let filtered = allTasks;

    // Apply client-side status filter
    if (localFilters.status !== "all") {
      filtered = filtered.filter((t) => t.status === localFilters.status);
    }

    // Apply client-side priority filter
    if (localFilters.priority !== "all") {
      filtered = filtered.filter((t) => t.priority === localFilters.priority);
    }

    const active = filtered.filter((t) => t.status !== "done");
    const completed = filtered.filter((t) => t.status === "done");

    return { activeTasks: active, completedTasks: completed };
  }, [allTasks, localFilters]);

  const isEmpty = activeTasks.length === 0 && completedTasks.length === 0;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {/* Quick add input */}
      <InlineTaskInput />

      {/* Filters */}
      {showFilters && (
        <TaskFilters
          filters={localFilters}
          onFiltersChange={setLocalFilters}
          className="py-1"
        />
      )}

      {/* Active tasks */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center gap-2 py-12 text-muted-foreground">
          <Inbox className="size-10 opacity-40" />
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <div className="flex flex-col">
          <AnimatePresence mode="popLayout" initial={false}>
            {activeTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                draggable={draggable}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed section */}
      {completedTasks.length > 0 && (
        <div className="mt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCompleted((v) => !v)}
            className="w-full justify-start gap-1.5 text-xs text-muted-foreground"
          >
            {showCompleted ? (
              <ChevronDown className="size-3" />
            ) : (
              <ChevronRight className="size-3" />
            )}
            Completed ({completedTasks.length})
          </Button>

          <AnimatePresence initial={false}>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {completedTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      draggable={false}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
