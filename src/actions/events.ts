"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";
import { createEventSchema, updateEventSchema } from "@/lib/validators";
import type { ScheduledEvent } from "@/types/task";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getWeekEvents(weekStart: string, weekEnd: string) {
  const userId = await getUserId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scheduled_events")
    .select("*, task:tasks(*)")
    .eq("user_id", userId)
    .gte("start_time", weekStart)
    .lte("end_time", weekEnd)
    .order("start_time", { ascending: true });

  if (error) throw new Error(error.message);
  return data as ScheduledEvent[];
}

export async function getDayEvents(date: string) {
  const dayStart = `${date}T00:00:00`;
  const dayEnd = `${date}T23:59:59`;
  return getWeekEvents(dayStart, dayEnd);
}

export async function scheduleTask(
  taskId: string,
  startTime: string,
  endTime: string
) {
  const userId = await getUserId();
  const supabase = await createClient();

  // Get the task to use its title
  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .select("title, category_id, categories(color)")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single();

  if (taskError) throw new Error(taskError.message);

  // Create the event
  const { data: event, error: eventError } = await supabase
    .from("scheduled_events")
    .insert({
      user_id: userId,
      task_id: taskId,
      title: task.title,
      start_time: startTime,
      end_time: endTime,
      color: (task as any).categories?.color || null,
    })
    .select("*, task:tasks(*)")
    .single();

  if (eventError) throw new Error(eventError.message);

  // Mark task as scheduled
  await supabase
    .from("tasks")
    .update({ is_scheduled: true })
    .eq("id", taskId)
    .eq("user_id", userId);

  revalidatePath("/week");
  revalidatePath("/today");
  revalidatePath("/inbox");
  return event as ScheduledEvent;
}

export async function rescheduleEvent(
  eventId: string,
  startTime: string,
  endTime: string
) {
  const userId = await getUserId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scheduled_events")
    .update({ start_time: startTime, end_time: endTime })
    .eq("id", eventId)
    .eq("user_id", userId)
    .select("*, task:tasks(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/week");
  revalidatePath("/today");
  return data as ScheduledEvent;
}

export async function unscheduleEvent(eventId: string) {
  const userId = await getUserId();
  const supabase = await createClient();

  // Get the event first to find the associated task
  const { data: event, error: fetchError } = await supabase
    .from("scheduled_events")
    .select("task_id")
    .eq("id", eventId)
    .eq("user_id", userId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  // Delete the event
  const { error: deleteError } = await supabase
    .from("scheduled_events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", userId);

  if (deleteError) throw new Error(deleteError.message);

  // If there was an associated task, check if it has other events
  if (event.task_id) {
    const { data: remainingEvents } = await supabase
      .from("scheduled_events")
      .select("id")
      .eq("task_id", event.task_id)
      .eq("user_id", userId);

    if (!remainingEvents || remainingEvents.length === 0) {
      await supabase
        .from("tasks")
        .update({ is_scheduled: false })
        .eq("id", event.task_id)
        .eq("user_id", userId);
    }
  }

  revalidatePath("/week");
  revalidatePath("/today");
  revalidatePath("/inbox");
}

export async function createTimeBlock(input: unknown) {
  const userId = await getUserId();
  const parsed = createEventSchema.parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("scheduled_events")
    .insert({ ...parsed, user_id: userId })
    .select("*, task:tasks(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/week");
  revalidatePath("/today");
  return data as ScheduledEvent;
}

export async function deleteEvent(eventId: string) {
  return unscheduleEvent(eventId);
}
