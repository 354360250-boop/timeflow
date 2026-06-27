import { useFocusStore } from '../../stores/focusStore';
import { Button } from '../../components/ui';
import { useEffect } from 'react';

export function FocusSession() {
  const { activeSession, elapsed, mode, endSession } = useFocusStore();

  if (!activeSession) return null;

  const planned = activeSession.planned_duration;
  const progress = planned > 0 ? Math.min((elapsed / planned) * 100, 100) : 0;
  const remaining = Math.max(planned - elapsed, 0);

  return (
    <div className="fixed inset-0 z-40 bg-gray-950 flex flex-col items-center justify-center">
      <div className="text-center space-y-8">
        <div className="text-sm font-medium text-brand-400 uppercase tracking-widest">
          {mode === 'pomodoro' ? '番茄钟' : mode === 'deep_work' ? '深度工作' : '自由专注'}
        </div>

        <div className="text-8xl font-mono font-bold tracking-tight">
          {formatTime(elapsed)}
        </div>

        {planned > 0 && (
          <div className="w-64">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>已过</span>
              <span>{formatTime(remaining)} 剩余</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 rounded-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex gap-4">
          <Button onClick={() => endSession()} variant="secondary">
            结束专注
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
