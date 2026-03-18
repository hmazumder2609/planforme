"use client";

import { CheckCircle2, Inbox } from "lucide-react";
import { TaskList } from "@/components/tasks/task-list";
import { InlineTaskInput } from "@/components/tasks/inline-task-input";
import { useTasksQuery } from "@/hooks/use-tasks";

export default function InboxPage() {
  const { data: tasks } = useTasksQuery({
    is_scheduled: false,
  });

  const activeTasks = tasks?.filter((t) => t.status !== "done") ?? [];
  const isEmpty = activeTasks.length === 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-6 py-4">
        <div className="flex items-center gap-3">
          <Inbox className="h-5 w-5 text-muted-foreground" />
          <div>
            <h1 className="text-xl font-bold">Inbox</h1>
            <p className="text-sm text-muted-foreground">
              {activeTasks.length} unscheduled{" "}
              {activeTasks.length === 1 ? "task" : "tasks"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="mb-4">
            <InlineTaskInput />
          </div>

          {isEmpty ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-1 text-lg font-medium">
                Your inbox is empty. Nice work!
              </h3>
              <p className="text-sm text-muted-foreground">
                All tasks have been scheduled or completed.
              </p>
            </div>
          ) : (
            <TaskList
              filters={{ is_scheduled: false }}
              showFilters
              draggable={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}
