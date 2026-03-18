"use client";

import {
  PlusIcon,
  PanelLeftIcon,
  ListTodoIcon,
  CalendarIcon,
  CalendarDaysIcon,
  InboxIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarCheckIcon,
} from "lucide-react";

import { useUiStore } from "@/stores/ui-store";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";

interface CommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const storeIsOpen = useUiStore((s) => s.isCommandPaletteOpen);
  const storeSetOpen = useUiStore((s) => s.setCommandPaletteOpen);

  const isOpen = open ?? storeIsOpen;
  const setOpen = onOpenChange ?? storeSetOpen;
  const openTaskForm = useUiStore((s) => s.openTaskForm);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const toggleTaskSidebar = useUiStore((s) => s.toggleTaskSidebar);
  const goToPrevWeek = useUiStore((s) => s.goToPrevWeek);
  const goToNextWeek = useUiStore((s) => s.goToNextWeek);
  const goToCurrentWeek = useUiStore((s) => s.goToCurrentWeek);

  function runAction(action: () => void) {
    action();
    setOpen(false);
  }

  return (
    <CommandDialog open={isOpen} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runAction(() => openTaskForm())}>
              <PlusIcon />
              <span>New Task</span>
              <CommandShortcut>N</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runAction(toggleSidebar)}>
              <PanelLeftIcon />
              <span>Toggle Sidebar</span>
              <CommandShortcut>B</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runAction(toggleTaskSidebar)}>
              <ListTodoIcon />
              <span>Toggle Task Panel</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runAction(goToCurrentWeek)}>
              <CalendarDaysIcon />
              <span>Go to Week View</span>
            </CommandItem>
            <CommandItem onSelect={() => runAction(goToCurrentWeek)}>
              <CalendarCheckIcon />
              <span>Go to Today</span>
              <CommandShortcut>T</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <InboxIcon />
              <span>Go to Inbox</span>
            </CommandItem>
            <CommandItem>
              <SettingsIcon />
              <span>Go to Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Week">
            <CommandItem onSelect={() => runAction(goToPrevWeek)}>
              <ChevronLeftIcon />
              <span>Previous Week</span>
              <CommandShortcut>[</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runAction(goToNextWeek)}>
              <ChevronRightIcon />
              <span>Next Week</span>
              <CommandShortcut>]</CommandShortcut>
            </CommandItem>
            <CommandItem onSelect={() => runAction(goToCurrentWeek)}>
              <CalendarIcon />
              <span>Current Week</span>
              <CommandShortcut>T</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
