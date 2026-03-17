import { create } from "zustand";
import type { DragItem, DropTarget } from "@/types/calendar";

interface DragState {
  activeItem: DragItem | null;
  hoverTarget: DropTarget | null;
  isDragging: boolean;

  setActiveItem: (item: DragItem | null) => void;
  setHoverTarget: (target: DropTarget | null) => void;
  setIsDragging: (dragging: boolean) => void;
  reset: () => void;
}

export const useDragStore = create<DragState>((set) => ({
  activeItem: null,
  hoverTarget: null,
  isDragging: false,

  setActiveItem: (item) => set({ activeItem: item, isDragging: !!item }),
  setHoverTarget: (target) => set({ hoverTarget: target }),
  setIsDragging: (dragging) => set({ isDragging: dragging }),
  reset: () => set({ activeItem: null, hoverTarget: null, isDragging: false }),
}));
