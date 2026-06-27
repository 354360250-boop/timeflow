import { useEffect } from 'react';
import { useTimerStore } from '../stores/timerStore';

export function useTimer() {
  const store = useTimerStore();

  useEffect(() => {
    store.loadCurrent();
    return () => store.cleanup();
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return { ...store, formatTime };
}
