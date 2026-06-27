export interface Project {
  id: string;
  name: string;
  color?: string;
  created_at: string;
}

export interface Task {
  id: string;
  project_id?: string;
  title: string;
  priority: number;   // 0=P0, 1=P1, 2=P2, 3=P3
  estimated_hours?: number;
  status: 'todo' | 'in_progress' | 'done';
  tags?: string[];
  created_at: string;
}

export interface TimeEntry {
  id: string;
  task_id?: string;
  project_id?: string;
  start_time: string;
  end_time?: string;
  duration_seconds?: number;
  track_mode: 'auto' | 'manual';
  plan_mark?: 'on_plan' | 'ahead' | 'delayed';
  window_title?: string;
  app_name?: string;
}

export interface FocusSession {
  id: string;
  task_id?: string;
  mode: 'pomodoro' | 'deep_work' | 'free';
  planned_duration: number;
  actual_duration?: number;
  interruption_count: number;
  self_rating?: number;
  started_at: string;
  ended_at?: string;
}

export interface DailyReport {
  date: string;
  total_seconds: number;
  focus_sessions: number;
  focus_seconds: number;
  projects: { project_id: string; seconds: number }[];
  timeline: {
    id: string;
    task_id?: string;
    start_time: string;
    end_time?: string;
    duration_seconds?: number;
    track_mode: string;
  }[];
}

export interface WeeklyReport {
  week_start: string;
  week_end: string;
  daily: { day: string; seconds: number }[];
  focus_scores: { day: string; avg_rating: number }[];
  projects: { project_id: string; seconds: number }[];
  total_seconds: number;
}

export interface FocusStats {
  total_sessions: number;
  total_minutes: number;
  avg_rating: number;
}
