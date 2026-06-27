import { create } from 'zustand';
import type { TimeEntry } from '../types';
import { api } from '../services/api';

interface TimerState {
  currentEntry: TimeEntry | null;
  elapsed: number;
  isRunning: boolean;
  intervalId: number | null;

  startTimer: (taskId?: string, projectId?: string) => Promise<void>;
  stopTimer: () => Promise<void>;
  tick: () => void;
  loadCurrent: () => Promise<void>;
  cleanup: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  currentEntry: null,
  elapsed: 0,
  isRunning: false,
  intervalId: null,

  startTimer: async (taskId, projectId) => {
    const entry = await api.startTimer({
      task_id: taskId,
      project_id: projectId,
      track_mode: 'manual',
    }) as TimeEntry;
    const elapsed = entry.duration_seconds || 0;
    const id = window.setInterval(() => get().tick(), 1000);
    set({ currentEntry: entry, elapsed, isRunning: true, intervalId: id });
  },

  stopTimer: async () => {
    const { currentEntry, intervalId } = get();
    if (intervalId) window.clearInterval(intervalId);
    if (currentEntry) {
      await api.stopTimer(currentEntry.id);
    }
    set({ currentEntry: null, elapsed: 0, isRunning: false, intervalId: null });
  },

  tick: () => {
    set((s) => ({ elapsed: s.elapsed + 1 }));
  },

  loadCurrent: async () => {
    const entry = await api.getCurrentEntry() as TimeEntry | null;
    if (entry) {
      const start = new Date(entry.start_time).getTime();
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const id = window.setInterval(() => get().tick(), 1000);
      set({ currentEntry: entry, elapsed, isRunning: true, intervalId: id });
    }
  },

  cleanup: () => {
    const { intervalId } = get();
    if (intervalId) window.clearInterval(intervalId);
  },
}));
