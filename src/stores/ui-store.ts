import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  taskSidebarOpen: boolean;
  weekOffset: number; // 0 = current week, -1 = last week, 1 = next week
  selectedTaskId: string | null;
  isTaskFormOpen: boolean;
  editingTaskId: string | null;
  isCommandPaletteOpen: boolean;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleTaskSidebar: () => void;
  setTaskSidebarOpen: (open: boolean) => void;
  setWeekOffset: (offset: number) => void;
  goToPrevWeek: () => void;
  goToNextWeek: () => void;
  goToCurrentWeek: () => void;
  setSelectedTaskId: (id: string | null) => void;
  openTaskForm: (editingId?: string) => void;
  closeTaskForm: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  taskSidebarOpen: true,
  weekOffset: 0,
  selectedTaskId: null,
  isTaskFormOpen: false,
  editingTaskId: null,
  isCommandPaletteOpen: false,

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTaskSidebar: () => set((s) => ({ taskSidebarOpen: !s.taskSidebarOpen })),
  setTaskSidebarOpen: (open) => set({ taskSidebarOpen: open }),
  setWeekOffset: (offset) => set({ weekOffset: offset }),
  goToPrevWeek: () => set((s) => ({ weekOffset: s.weekOffset - 1 })),
  goToNextWeek: () => set((s) => ({ weekOffset: s.weekOffset + 1 })),
  goToCurrentWeek: () => set({ weekOffset: 0 }),
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  openTaskForm: (editingId) => set({ isTaskFormOpen: true, editingTaskId: editingId ?? null }),
  closeTaskForm: () => set({ isTaskFormOpen: false, editingTaskId: null }),
  setCommandPaletteOpen: (open) => set({ isCommandPaletteOpen: open }),
}));
