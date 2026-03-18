"use client";

import { PanelRightClose, PanelRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WeeklyView } from "@/components/calendar/weekly-view";
import { TaskList } from "@/components/tasks/task-list";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export default function WeekPage() {
  const { taskSidebarOpen, toggleTaskSidebar } = useUiStore();

  return (
    <div className="flex h-full">
      <div className="flex-1 overflow-hidden">
        <WeeklyView />
      </div>

      <div
        className={cn(
          "flex h-full flex-col border-l bg-background transition-all duration-300",
          taskSidebarOpen ? "w-[320px]" : "w-0"
        )}
      >
        {taskSidebarOpen && (
          <>
            <div className="flex h-12 items-center justify-between border-b px-4">
              <h2 className="text-sm font-semibold">Tasks</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleTaskSidebar}
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <TaskList
                filters={{ is_scheduled: false }}
                draggable
              />
            </div>
          </>
        )}
      </div>

      {!taskSidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-16 z-10 h-8 w-8"
          onClick={toggleTaskSidebar}
        >
          <PanelRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
