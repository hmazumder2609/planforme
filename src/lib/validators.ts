import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).nullable().optional(),
  priority: z.number().int().min(1).max(4).default(3),
  category_id: z.string().uuid().nullable().optional(),
  due_date: z.string().nullable().optional(),
  estimated_minutes: z.number().int().min(1).max(480).nullable().optional(),
});

export const updateTaskSchema = createTaskSchema.partial().extend({
  status: z.enum(["todo", "in_progress", "done", "cancelled"]).optional(),
  is_scheduled: z.boolean().optional(),
  sort_order: z.number().int().optional(),
});

export const createEventSchema = z.object({
  task_id: z.string().uuid().nullable().optional(),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).nullable().optional(),
  start_time: z.string(),
  end_time: z.string(),
  all_day: z.boolean().default(false),
  color: z.string().nullable().optional(),
});

export const updateEventSchema = createEventSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Invalid color").default("#6366f1"),
  icon: z.string().max(10).nullable().optional(),
});

export const updatePreferencesSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  week_start_day: z.number().int().min(0).max(6).optional(),
  day_start_hour: z.number().int().min(0).max(23).optional(),
  day_end_hour: z.number().int().min(0).max(23).optional(),
  time_slot_minutes: z.number().int().refine(v => [15, 30, 60].includes(v)).optional(),
  default_task_duration: z.number().int().min(5).max(480).optional(),
  show_weekends: z.boolean().optional(),
  ai_enabled: z.boolean().optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
