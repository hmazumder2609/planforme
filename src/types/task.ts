export type TaskStatus = "todo" | "in_progress" | "done" | "cancelled";
export type TaskPriority = 1 | 2 | 3 | 4;
export type RecurrenceType = "none" | "daily" | "weekly";

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  estimated_minutes: number | null;
  completed_at: string | null;
  is_scheduled: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: Category;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string | null;
  sort_order: number;
  created_at: string;
}

export interface ScheduledEvent {
  id: string;
  user_id: string;
  task_id: string | null;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  all_day: boolean;
  recurrence_type: RecurrenceType | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  task?: Task;
}

export interface UserPreferences {
  user_id: string;
  theme: "light" | "dark" | "system";
  week_start_day: number;
  day_start_hour: number;
  day_end_hour: number;
  time_slot_minutes: number;
  default_task_duration: number;
  show_weekends: boolean;
  ai_enabled: boolean;
  ai_provider: string | null;
  updated_at: string;
}
