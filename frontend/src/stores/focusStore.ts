import { create } from 'zustand';
import type { FocusSession } from '../types';
import { api } from '../services/api';

interface FocusState {
  activeSession: FocusSession | null;
  elapsed: number;
  mode: 'pomodoro' | 'deep_work' | 'free' | null;
  intervalId: number | null;
  showRating: boolean;

  startSession: (taskId: string | undefined, mode: string, plannedDuration: number) => Promise<void>;
  endSession: (interruptions?: number) => Promise<void>;
  submitRating: (rating: number) => Promise<void>;
  dismissRating: () => void;
  tick: () => void;
  cleanup: () => void;
}

export const useFocusStore = create<FocusState>((set, get) => ({
  activeSession: null,
  elapsed: 0,
  mode: null,
  intervalId: null,
  showRating: false,

  startSession: async (taskId, mode, plannedDuration) => {
    const session = await api.startFocus({
      task_id: taskId,
      mode,
      planned_duration: plannedDuration,
    }) as FocusSession;
    const start = new Date(session.started_at).getTime();
    const elapsed = Math.floor((Date.now() - start) / 1000);
    const id = window.setInterval(() => get().tick(), 1000);
    set({ activeSession: session, elapsed, mode: mode as FocusState['mode'], intervalId: id, showRating: false });
  },

  endSession: async (interruptions = 0) => {
    const { activeSession, intervalId } = get();
    if (intervalId) window.clearInterval(intervalId);
    if (activeSession) {
      await api.endFocus(activeSession.id, { interruption_count: interruptions });
    }
    set({ activeSession: null, elapsed: 0, mode: null, intervalId: null, showRating: true });
  },

  submitRating: async (rating) => {
    const { activeSession } = get();
    // Use the session that was just ended - stored before clearing
    set({ showRating: false });
  },

  dismissRating: () => set({ showRating: false }),

  tick: () => {
    set((s) => ({ elapsed: s.elapsed + 1 }));
  },

  cleanup: () => {
    const { intervalId } = get();
    if (intervalId) window.clearInterval(intervalId);
  },
}));
