"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTasks, createTask, updateTask, deleteTask, completeTask } from "@/actions/tasks";
import type { Task } from "@/types/task";
import type { CreateTaskInput, UpdateTaskInput } from "@/lib/validators";

export function useTasksQuery(filters?: {
  status?: string;
  priority?: number;
  category_id?: string;
  is_scheduled?: boolean;
  due_date?: string;
}) {
  return useQuery({
    queryKey: ["tasks", filters],
    queryFn: () => getTasks(filters),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) =>
      updateTask(id, input),
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueriesData({ queryKey: ["tasks"] });

      queryClient.setQueriesData({ queryKey: ["tasks"] }, (old: Task[] | undefined) => {
        if (!old) return old;
        return old.map((task) =>
          task.id === id ? { ...task, ...input } : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueriesData({ queryKey: ["tasks"] });

      queryClient.setQueriesData({ queryKey: ["tasks"] }, (old: Task[] | undefined) => {
        if (!old) return old;
        return old.filter((task) => task.id !== id);
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => completeTask(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueriesData({ queryKey: ["tasks"] });

      queryClient.setQueriesData({ queryKey: ["tasks"] }, (old: Task[] | undefined) => {
        if (!old) return old;
        return old.map((task) =>
          task.id === id
            ? { ...task, status: "done", completed_at: new Date().toISOString() }
            : task
        );
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousTasks) {
        context.previousTasks.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
