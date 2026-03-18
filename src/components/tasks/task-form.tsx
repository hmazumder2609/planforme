"use client";

import { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { createTaskSchema, updateTaskSchema } from "@/lib/validators";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validators";
import { PRIORITY_LABELS } from "@/lib/constants";
import { useTasksQuery, useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import { useUiStore } from "@/stores/ui-store";
import { getCategories } from "@/actions/categories";
import type { TaskPriority } from "@/types/task";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export function TaskForm() {
  const { isTaskFormOpen, editingTaskId, closeTaskForm } = useUiStore();
  const isEditing = !!editingTaskId;

  const { data: tasks } = useTasksQuery();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const editingTask = useMemo(() => {
    if (!editingTaskId || !tasks) return null;
    return tasks.find((t) => t.id === editingTaskId) ?? null;
  }, [editingTaskId, tasks]);

  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm({
    resolver: zodResolver(createTaskSchema) as any,
    defaultValues: {
      title: "",
      description: null,
      priority: 3,
      category_id: null,
      due_date: null,
      estimated_minutes: null,
    },
  });

  // Populate form when editing
  useEffect(() => {
    if (editingTask) {
      form.reset({
        title: editingTask.title,
        description: editingTask.description,
        priority: editingTask.priority,
        category_id: editingTask.category_id,
        due_date: editingTask.due_date,
        estimated_minutes: editingTask.estimated_minutes,
      } as any);
    } else {
      form.reset({
        title: "",
        description: null,
        priority: 3,
        category_id: null,
        due_date: null,
        estimated_minutes: null,
      });
    }
  }, [editingTask, form]);

  const isPending = createTask.isPending || updateTask.isPending;

  function onSubmit(values: Record<string, unknown>) {
    if (isEditing && editingTaskId) {
      updateTask.mutate(
        { id: editingTaskId, input: values as unknown as UpdateTaskInput },
        {
          onSuccess: () => {
            toast.success("Task updated");
            closeTaskForm();
          },
          onError: () => toast.error("Failed to update task"),
        }
      );
    } else {
      createTask.mutate(values as unknown as CreateTaskInput, {
        onSuccess: () => {
          toast.success("Task created");
          closeTaskForm();
        },
        onError: () => toast.error("Failed to create task"),
      });
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  }

  return (
    <Dialog
      open={isTaskFormOpen}
      onOpenChange={(open) => {
        if (!open) closeTaskForm();
      }}
    >
      <DialogContent
        className="sm:max-w-md"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Task" : "New Task"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the task details below."
              : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
        >
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-title">Title</Label>
            <Input
              id="task-title"
              placeholder="What needs to be done?"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              placeholder="Add more details..."
              rows={3}
              {...form.register("description")}
            />
          </div>

          {/* Priority & Category row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <Select
                    value={String(field.value ?? 3)}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {([1, 2, 3, 4] as const).map((p) => (
                        <SelectItem key={p} value={String(p)}>
                          {PRIORITY_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <Label>Category</Label>
              <Controller
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <Select
                    value={field.value ?? "none"}
                    onValueChange={(val) =>
                      field.onChange(val === "none" ? null : val)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {categories?.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <span
                            className="inline-block size-2 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Due date & Estimated time row */}
          <div className="grid grid-cols-2 gap-3">
            {/* Due date */}
            <div className="flex flex-col gap-1.5">
              <Label>Due Date</Label>
              <Controller
                control={form.control}
                name="due_date"
                render={({ field }) => {
                  const selectedDate = field.value
                    ? parseISO(field.value)
                    : undefined;

                  return (
                    <Popover>
                      <PopoverTrigger
                        render={
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          />
                        }
                      >
                        <CalendarIcon className="size-3.5" />
                        {field.value
                          ? format(parseISO(field.value), "MMM d, yyyy")
                          : "Pick a date"}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) =>
                            field.onChange(
                              date ? format(date, "yyyy-MM-dd") : null
                            )
                          }
                        />
                      </PopoverContent>
                    </Popover>
                  );
                }}
              />
            </div>

            {/* Estimated minutes */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="task-estimated">Est. Minutes</Label>
              <Input
                id="task-estimated"
                type="number"
                min={1}
                max={480}
                placeholder="30"
                {...form.register("estimated_minutes", {
                  setValueAs: (v) => {
                    if (v === "" || v === null || v === undefined) return null;
                    const num = Number(v);
                    return isNaN(num) ? null : num;
                  },
                })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={closeTaskForm}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-3.5 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
