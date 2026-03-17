export const PRIORITY_LABELS: Record<number, string> = {
  1: "Urgent",
  2: "High",
  3: "Medium",
  4: "Low",
};

export const PRIORITY_COLORS: Record<number, string> = {
  1: "text-red-500",
  2: "text-orange-500",
  3: "text-blue-500",
  4: "text-gray-400",
};

export const PRIORITY_BG_COLORS: Record<number, string> = {
  1: "bg-red-500/10 text-red-700 dark:text-red-400",
  2: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  3: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  4: "bg-gray-500/10 text-gray-700 dark:text-gray-400",
};

export const STATUS_LABELS: Record<string, string> = {
  todo: "To Do",
  in_progress: "In Progress",
  done: "Done",
  cancelled: "Cancelled",
};

export const DEFAULT_CATEGORIES = [
  { name: "Work", color: "#3b82f6" },
  { name: "Personal", color: "#10b981" },
  { name: "Health", color: "#f59e0b" },
];

export const HOUR_HEIGHT = 60; // pixels per hour in calendar
export const SLOT_HEIGHT = 30; // pixels per 30-min slot
export const DAY_START_DEFAULT = 6; // 6 AM
export const DAY_END_DEFAULT = 22; // 10 PM
export const SIDEBAR_WIDTH = 280;
export const TASK_SIDEBAR_WIDTH = 320;
