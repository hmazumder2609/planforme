import type { Task, ScheduledEvent } from "@/types/task";
import { format } from "date-fns";

export function buildSchedulingPrompt(
  tasks: Task[],
  events: ScheduledEvent[],
  date: string,
  dayStartHour: number,
  dayEndHour: number
): string {
  const formattedDate = format(new Date(date), "EEEE, MMMM d, yyyy");

  const taskLines = tasks.map((task) => {
    const est = task.estimated_minutes ?? 30;
    const due = task.due_date
      ? format(new Date(task.due_date), "MMM d, yyyy")
      : "No due date";
    const category = task.category?.name ?? "Uncategorized";
    return `- [${task.id}] ${task.title} (Priority: P${task.priority}, Est: ${est}min, Due: ${due}, Category: ${category})`;
  });

  const eventLines = events.map((event) => {
    const start = format(new Date(event.start_time), "h:mm a");
    const end = format(new Date(event.end_time), "h:mm a");
    return `- ${event.title} (${start} - ${end})`;
  });

  const startFormatted = `${dayStartHour}:00 ${dayStartHour < 12 ? "AM" : "PM"}`;
  const endFormatted = `${dayEndHour > 12 ? dayEndHour - 12 : dayEndHour}:00 ${dayEndHour < 12 ? "AM" : "PM"}`;

  let prompt = `Schedule the following tasks for ${formattedDate}.

Work hours: ${startFormatted} to ${endFormatted}
Date for scheduling (use for ISO timestamps): ${date}

`;

  if (taskLines.length > 0) {
    prompt += `Unscheduled tasks:\n${taskLines.join("\n")}\n\n`;
  } else {
    prompt += "No unscheduled tasks for this day.\n\n";
  }

  if (eventLines.length > 0) {
    prompt += `Existing events (do NOT schedule over these):\n${eventLines.join("\n")}\n`;
  } else {
    prompt += "No existing events for this day.\n";
  }

  return prompt;
}

export function buildPriorityPrompt(
  title: string,
  description?: string,
  existingTasks?: Task[]
): string {
  let prompt = `Suggest a priority level for this task:

Title: ${title}`;

  if (description) {
    prompt += `\nDescription: ${description}`;
  }

  if (existingTasks && existingTasks.length > 0) {
    const taskSummary = existingTasks
      .slice(0, 10)
      .map((t) => `- ${t.title} (P${t.priority})`)
      .join("\n");
    prompt += `\n\nExisting tasks for context:\n${taskSummary}`;
  }

  return prompt;
}
