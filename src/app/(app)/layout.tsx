"use client";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { DndContextProvider } from "@/components/dnd/dnd-context-provider";
import { TaskForm } from "@/components/tasks/task-form";
import { CommandPalette } from "@/components/layout/command-palette";
import { ScheduleAssistant } from "@/components/ai/schedule-assistant";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useKeyboardShortcuts();

  return (
    <DndContextProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <AppHeader />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>

      <TaskForm />
      <CommandPalette />
      <ScheduleAssistant />
    </DndContextProvider>
  );
}
