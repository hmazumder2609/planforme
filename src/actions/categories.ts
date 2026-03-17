"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";
import { createCategorySchema } from "@/lib/validators";
import type { Category } from "@/types/task";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getCategories() {
  const userId = await getUserId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });

  if (error) throw new Error(error.message);
  return data as Category[];
}

export async function createCategory(input: unknown) {
  const userId = await getUserId();
  const parsed = createCategorySchema.parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .insert({ ...parsed, user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/inbox");
  revalidatePath("/week");
  return data as Category;
}

export async function updateCategory(id: string, input: unknown) {
  const userId = await getUserId();
  const parsed = createCategorySchema.partial().parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("categories")
    .update(parsed)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/inbox");
  revalidatePath("/week");
  return data as Category;
}

export async function deleteCategory(id: string) {
  const userId = await getUserId();
  const supabase = await createClient();

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  revalidatePath("/inbox");
  revalidatePath("/week");
}
