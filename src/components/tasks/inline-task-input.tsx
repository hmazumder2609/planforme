"use client";

import { useState, useRef, type KeyboardEvent } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCreateTask } from "@/hooks/use-tasks";
import { toast } from "sonner";
import type { Task } from "@/types/task";

interface InlineTaskInputProps {
  onCreated?: (task: Task) => void;
  className?: string;
}

export function InlineTaskInput({ onCreated, className }: InlineTaskInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const createTask = useCreateTask();

  async function handleSubmit() {
    const title = value.trim();
    if (!title) return;

    createTask.mutate(
      { title, priority: 3 },
      {
        onSuccess: (data) => {
          setValue("");
          toast.success("Task added");
          onCreated?.(data as Task);
          inputRef.current?.focus();
        },
        onError: () => {
          toast.error("Failed to add task");
        },
      }
    );
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-dashed border-border/60 px-2.5 py-1.5 transition-colors",
        "focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20",
        "hover:border-border",
        className
      )}
    >
      <Plus className="size-4 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Add a task..."
        disabled={createTask.isPending}
        className={cn(
          "flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/60",
          createTask.isPending && "opacity-50"
        )}
      />
    </div>
  );
}
