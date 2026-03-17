"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";
import { createTaskSchema, updateTaskSchema } from "@/lib/validators";
import type { Task } from "@/types/task";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getTasks(filters?: {
  status?: string;
  priority?: number;
  category_id?: string;
  is_scheduled?: boolean;
  due_date?: string;
}) {
  const userId = await getUserId();
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select("*, category:categories(*)")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.priority) query = query.eq("priority", filters.priority);
  if (filters?.category_id) query = query.eq("category_id", filters.category_id);
  if (filters?.is_scheduled !== undefined) query = query.eq("is_scheduled", filters.is_scheduled);
  if (filters?.due_date) query = query.eq("due_date", filters.due_date);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as Task[];
}

export async function getTask(id: string) {
  const userId = await getUserId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("*, category:categories(*)")
    .eq("id", id)
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data as Task;
}

export async function createTask(input: unknown) {
  const userId = await getUserId();
  const parsed = createTaskSchema.parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .insert({ ...parsed, user_id: userId })
    .select("*, category:categories(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/inbox");
  revalidatePath("/today");
  revalidatePath("/week");
  return data as Task;
}

export async function updateTask(id: string, input: unknown) {
  const userId = await getUserId();
  const parsed = updateTaskSchema.parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .update(parsed)
    .eq("id", id)
    .eq("user_id", userId)
    .select("*, category:categories(*)")
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/inbox");
  revalidatePath("/today");
  revalidatePath("/week");
  return data as Task;
}

export async function deleteTask(id: string) {
  const userId = await getUserId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/inbox");
  revalidatePath("/today");
  revalidatePath("/week");
}

export async function completeTask(id: string) {
  return updateTask(id, {
    status: "done",
    completed_at: new Date().toISOString(),
  });
}

export async function reorderTasks(taskIds: string[]) {
  const userId = await getUserId();
  const supabase = await createClient();

  const updates = taskIds.map((id, index) =>
    supabase
      .from("tasks")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("user_id", userId)
  );

  await Promise.all(updates);
  revalidatePath("/inbox");
  revalidatePath("/today");
}
