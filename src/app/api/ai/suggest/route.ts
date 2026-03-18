import { streamObject, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { auth } from "@/lib/auth/config";
import { SCHEDULING_SYSTEM_PROMPT, PRIORITY_SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { buildSchedulingPrompt, buildPriorityPrompt } from "@/lib/ai/scheduling-agent";
import type { Task, TaskPriority } from "@/types/task";

const scheduleSuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      taskId: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      reasoning: z.string(),
    })
  ),
});

const prioritySuggestionSchema = z.object({
  priority: z.number().min(1).max(4),
  reasoning: z.string(),
});

const requestSchema = z.object({
  action: z.enum(["auto_schedule", "suggest_priority"]),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().nullable(),
      priority: z.number(),
      estimated_minutes: z.number().nullable(),
      due_date: z.string().nullable(),
      category_name: z.string().nullable(),
    })
  ).optional(),
  events: z.array(
    z.object({
      title: z.string(),
      start_time: z.string(),
      end_time: z.string(),
    })
  ).optional(),
  date: z.string().optional(),
  dayStartHour: z.number().optional(),
  dayEndHour: z.number().optional(),
  taskTitle: z.string().optional(),
  taskDescription: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured. Please set the OPENAI_API_KEY environment variable.",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Invalid request body", details: parsed.error.flatten() }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { action } = parsed.data;

    if (action === "auto_schedule") {
      const { tasks = [], events = [], date, dayStartHour = 9, dayEndHour = 17 } = parsed.data;

      if (!date) {
        return new Response(
          JSON.stringify({ error: "Date is required for auto_schedule action" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      if (tasks.length === 0) {
        return new Response(
          JSON.stringify({ error: "No tasks provided to schedule" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      // Map request tasks to Task-like objects for the prompt builder
      const taskObjects: Task[] = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority as TaskPriority,
        estimated_minutes: t.estimated_minutes,
        due_date: t.due_date,
        user_id: session.user!.id!,
        status: "todo" as const,
        is_scheduled: false,
        sort_order: 0,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: null,
        category: t.category_name ? { id: "", user_id: "", name: t.category_name, color: "", icon: null, sort_order: 0, created_at: "" } : undefined,
      }));

      const eventObjects = events.map((e) => ({
        ...e,
        id: "",
        user_id: "",
        task_id: null,
        description: null,
        all_day: false,
        recurrence_type: null,
        color: null,
        created_at: "",
        updated_at: "",
      }));

      const userMessage = buildSchedulingPrompt(
        taskObjects,
        eventObjects,
        date,
        dayStartHour,
        dayEndHour
      );

      const result = streamObject({
        model: openai("gpt-4o-mini"),
        schema: scheduleSuggestionSchema,
        system: SCHEDULING_SYSTEM_PROMPT,
        prompt: userMessage,
      });

      return result.toTextStreamResponse();
    }

    if (action === "suggest_priority") {
      const { taskTitle, taskDescription, tasks = [] } = parsed.data;

      if (!taskTitle) {
        return new Response(
          JSON.stringify({ error: "Task title is required for suggest_priority action" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }

      const existingTasks: Task[] = tasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        priority: t.priority as TaskPriority,
        estimated_minutes: t.estimated_minutes,
        due_date: t.due_date,
        user_id: session.user!.id!,
        status: "todo" as const,
        is_scheduled: false,
        sort_order: 0,
        completed_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: null,
      }));

      const userMessage = buildPriorityPrompt(
        taskTitle,
        taskDescription ?? undefined,
        existingTasks
      );

      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        schema: prioritySuggestionSchema,
        system: PRIORITY_SYSTEM_PROMPT,
        prompt: userMessage,
      });

      return new Response(JSON.stringify(object), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ error: "Unknown action" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[AI Suggest API Error]", error);
    return new Response(
      JSON.stringify({ error: "An error occurred while processing your request" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
