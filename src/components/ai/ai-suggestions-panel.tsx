"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, XIcon, CheckCheck, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useTasksQuery } from "@/hooks/use-tasks";
import { useScheduleTask } from "@/hooks/use-events";
import type { ScheduleSuggestion } from "@/types/ai";

interface AiSuggestionsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  date: string;
}

interface SuggestionItem extends ScheduleSuggestion {
  taskTitle: string;
  accepted?: boolean;
  rejected?: boolean;
}

export function AiSuggestionsPanel({ isOpen, onClose, date }: AiSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);

  const { data: tasks = [] } = useTasksQuery({ is_scheduled: false });
  const scheduleTask = useScheduleTask();

  const fetchSuggestions = useCallback(async () => {
    if (tasks.length === 0) {
      toast.info("No unscheduled tasks to schedule.");
      return;
    }

    setIsLoading(true);
    setHasRequested(true);
    setSuggestions([]);

    try {
      const response = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "auto_schedule",
          tasks: tasks.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            estimated_minutes: t.estimated_minutes,
            due_date: t.due_date,
            category_name: t.category?.name ?? null,
          })),
          events: [],
          date,
          dayStartHour: 9,
          dayEndHour: 17,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to get suggestions");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
      }

      // Parse the streamed object - extract the final JSON from the stream
      // The Vercel AI SDK streamObject sends text deltas; we need the final object
      let parsed: { suggestions: ScheduleSuggestion[] } | null = null;

      // Try to extract JSON from the accumulated stream
      try {
        // streamObject sends the object progressively; the full text should be valid JSON at the end
        parsed = JSON.parse(accumulated);
      } catch {
        // Try to find JSON in the stream (the AI SDK may wrap it)
        const jsonMatch = accumulated.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        }
      }

      if (parsed?.suggestions && parsed.suggestions.length > 0) {
        const taskMap = new Map(tasks.map((t) => [t.id, t.title]));
        const items: SuggestionItem[] = parsed.suggestions.map((s) => ({
          ...s,
          taskTitle: taskMap.get(s.taskId) ?? "Unknown task",
        }));
        setSuggestions(items);
        toast.success(`Generated ${items.length} scheduling suggestions`);
      } else {
        toast.info("No scheduling suggestions could be generated.");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate suggestions";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [tasks, date]);

  const handleAccept = useCallback(
    async (suggestion: SuggestionItem) => {
      try {
        await scheduleTask.mutateAsync({
          taskId: suggestion.taskId,
          startTime: suggestion.startTime,
          endTime: suggestion.endTime,
        });

        setSuggestions((prev) =>
          prev.map((s) =>
            s.taskId === suggestion.taskId ? { ...s, accepted: true } : s
          )
        );
        toast.success(`Scheduled "${suggestion.taskTitle}"`);
      } catch {
        toast.error(`Failed to schedule "${suggestion.taskTitle}"`);
      }
    },
    [scheduleTask]
  );

  const handleReject = useCallback((taskId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.taskId === taskId ? { ...s, rejected: true } : s))
    );
  }, []);

  const handleAcceptAll = useCallback(async () => {
    const pending = suggestions.filter((s) => !s.accepted && !s.rejected);
    if (pending.length === 0) return;

    let successCount = 0;
    for (const suggestion of pending) {
      try {
        await scheduleTask.mutateAsync({
          taskId: suggestion.taskId,
          startTime: suggestion.startTime,
          endTime: suggestion.endTime,
        });
        setSuggestions((prev) =>
          prev.map((s) =>
            s.taskId === suggestion.taskId ? { ...s, accepted: true } : s
          )
        );
        successCount++;
      } catch {
        toast.error(`Failed to schedule "${suggestion.taskTitle}"`);
      }
    }

    if (successCount > 0) {
      toast.success(`Scheduled ${successCount} task${successCount > 1 ? "s" : ""}`);
    }
  }, [suggestions, scheduleTask]);

  const pendingCount = suggestions.filter((s) => !s.accepted && !s.rejected).length;

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    } catch {
      return isoString;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-0 top-0 z-50 h-full w-full max-w-md border-l bg-background shadow-2xl"
        >
          <div className="flex h-full flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h2 className="text-base font-semibold">AI Schedule Assistant</h2>
              </div>
              <Button variant="ghost" size="icon-sm" onClick={onClose}>
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1 px-4 py-3">
              {/* Auto-schedule trigger */}
              {!isLoading && (
                <Button
                  onClick={fetchSuggestions}
                  className="mb-4 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700"
                  disabled={isLoading || tasks.length === 0}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Auto-schedule my day
                </Button>
              )}

              {/* Loading state */}
              {isLoading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Analyzing your tasks and finding optimal time slots
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      ...
                    </motion.span>
                  </p>
                </div>
              )}

              {/* Empty state */}
              {!isLoading && hasRequested && suggestions.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    No suggestions generated. Try adding more tasks or adjusting your schedule.
                  </p>
                </div>
              )}

              {/* Initial state */}
              {!isLoading && !hasRequested && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Sparkles className="h-10 w-10 text-purple-500/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Click the button above to let AI optimize your schedule for the day.
                  </p>
                  {tasks.length === 0 && (
                    <p className="mt-2 text-xs text-muted-foreground/70">
                      No unscheduled tasks found. Add some tasks first.
                    </p>
                  )}
                </div>
              )}

              {/* Suggestions list */}
              {suggestions.length > 0 && (
                <div className="space-y-3">
                  {suggestions.map((suggestion) => (
                    <Card
                      key={suggestion.taskId}
                      size="sm"
                      className={
                        suggestion.accepted
                          ? "border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20"
                          : suggestion.rejected
                            ? "border-muted bg-muted/30 opacity-60"
                            : ""
                      }
                    >
                      <CardHeader className="pb-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">
                              {suggestion.taskTitle}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatTime(suggestion.startTime)} - {formatTime(suggestion.endTime)}
                            </p>
                          </div>
                          {suggestion.accepted && (
                            <Badge variant="outline" className="shrink-0 border-green-300 text-green-700 dark:border-green-800 dark:text-green-400">
                              Scheduled
                            </Badge>
                          )}
                          {suggestion.rejected && (
                            <Badge variant="outline" className="shrink-0 text-muted-foreground">
                              Skipped
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.reasoning}
                        </p>
                        {!suggestion.accepted && !suggestion.rejected && (
                          <div className="mt-2 flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 flex-1 text-xs"
                              onClick={() => handleAccept(suggestion)}
                              disabled={scheduleTask.isPending}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 flex-1 text-xs"
                              onClick={() => handleReject(suggestion.taskId)}
                            >
                              <XIcon className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>

            {/* Footer with Accept All */}
            {pendingCount > 0 && (
              <>
                <Separator />
                <div className="px-4 py-3">
                  <Button
                    onClick={handleAcceptAll}
                    className="w-full"
                    disabled={scheduleTask.isPending}
                  >
                    <CheckCheck className="mr-2 h-4 w-4" />
                    Accept all ({pendingCount})
                  </Button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
