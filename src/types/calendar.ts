export interface TimeSlot {
  hour: number;
  minute: number;
  date: Date;
}

export interface DragItem {
  type: "task" | "event";
  id: string;
  title: string;
  estimatedMinutes?: number;
  color?: string;
}

export interface DropTarget {
  date: Date;
  hour: number;
  minute: number;
}

export interface WeekDay {
  date: Date;
  dayName: string;
  dayNumber: number;
  isToday: boolean;
  isWeekend: boolean;
}
