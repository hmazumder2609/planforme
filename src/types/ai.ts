export interface ScheduleSuggestion {
  taskId: string;
  startTime: string;
  endTime: string;
  reasoning: string;
}

export interface PrioritySuggestion {
  suggestedPriority: 1 | 2 | 3 | 4;
  reasoning: string;
}

export interface DurationEstimate {
  estimatedMinutes: number;
  confidence: "low" | "medium" | "high";
}

export interface AiSuggestRequest {
  action: "auto_schedule" | "prioritize" | "suggest_duration";
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    priority: number;
    estimated_minutes: number | null;
    due_date: string | null;
    category_name: string | null;
  }>;
  events?: Array<{
    title: string;
    start_time: string;
    end_time: string;
  }>;
  preferences?: {
    day_start_hour: number;
    day_end_hour: number;
    time_slot_minutes: number;
  };
}
