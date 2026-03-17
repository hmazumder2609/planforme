"use client";

import { Calendar, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { NavLinks } from "./nav-links";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const { sidebarOpen, toggleSidebar } = useUiStore();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-sidebar transition-all duration-300",
        sidebarOpen ? "w-[240px]" : "w-[52px]"
      )}
    >
      <div className="flex h-14 items-center justify-between px-3">
        {sidebarOpen && (
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Calendar className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold">PlanForMe</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={toggleSidebar}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <Separator />

      <div className="flex-1 overflow-y-auto p-3">
        {sidebarOpen ? (
          <NavLinks />
        ) : (
          <nav className="flex flex-col items-center gap-2">
            <NavLinks />
          </nav>
        )}
      </div>
    </aside>
  );
}
