"use server";

import { auth } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/server";
import { updatePreferencesSchema } from "@/lib/validators";
import type { UserPreferences } from "@/types/task";

async function getUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function getPreferences() {
  const userId = await getUserId();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) throw new Error(error.message);
  return data as UserPreferences;
}

export async function updatePreferences(input: unknown) {
  const userId = await getUserId();
  const parsed = updatePreferencesSchema.parse(input);
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_preferences")
    .update(parsed)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as UserPreferences;
}
