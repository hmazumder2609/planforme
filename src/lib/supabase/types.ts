export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          icon?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          name?: string;
          color?: string;
          icon?: string | null;
          sort_order?: number;
        };
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          priority: number;
          status: string;
          due_date: string | null;
          estimated_minutes: number | null;
          completed_at: string | null;
          is_scheduled: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          priority?: number;
          status?: string;
          due_date?: string | null;
          estimated_minutes?: number | null;
          completed_at?: string | null;
          is_scheduled?: boolean;
          sort_order?: number;
        };
        Update: {
          category_id?: string | null;
          title?: string;
          description?: string | null;
          priority?: number;
          status?: string;
          due_date?: string | null;
          estimated_minutes?: number | null;
          completed_at?: string | null;
          is_scheduled?: boolean;
          sort_order?: number;
        };
      };
      scheduled_events: {
        Row: {
          id: string;
          user_id: string;
          task_id: string | null;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string;
          all_day: boolean;
          recurrence_type: string | null;
          color: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id?: string | null;
          title: string;
          description?: string | null;
          start_time: string;
          end_time: string;
          all_day?: boolean;
          recurrence_type?: string | null;
          color?: string | null;
        };
        Update: {
          task_id?: string | null;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string;
          all_day?: boolean;
          recurrence_type?: string | null;
          color?: string | null;
        };
      };
      user_preferences: {
        Row: {
          user_id: string;
          theme: string;
          week_start_day: number;
          day_start_hour: number;
          day_end_hour: number;
          time_slot_minutes: number;
          default_task_duration: number;
          show_weekends: boolean;
          ai_enabled: boolean;
          ai_provider: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          theme?: string;
          week_start_day?: number;
          day_start_hour?: number;
          day_end_hour?: number;
          time_slot_minutes?: number;
          default_task_duration?: number;
          show_weekends?: boolean;
          ai_enabled?: boolean;
          ai_provider?: string | null;
        };
        Update: {
          theme?: string;
          week_start_day?: number;
          day_start_hour?: number;
          day_end_hour?: number;
          time_slot_minutes?: number;
          default_task_duration?: number;
          show_weekends?: boolean;
          ai_enabled?: boolean;
          ai_provider?: string | null;
        };
      };
    };
  };
}
