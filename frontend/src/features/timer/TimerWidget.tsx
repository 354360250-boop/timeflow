import { useTimer } from '../../hooks/useTimer';
import { useTaskStore } from '../../stores/taskStore';
import { Button } from '../../components/ui';
import { useEffect } from 'react';

export function TimerWidget() {
  const { isRunning, elapsed, currentEntry, startTimer, stopTimer, formatTime } = useTimer();
  const { tasks, loadTasks } = useTaskStore();

  useEffect(() => {
    loadTasks('todo');
  }, []);

  const activeTasks = tasks.filter((t) => t.status !== 'done');

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="text-center mb-6">
        <div className="text-5xl font-mono font-bold tracking-wider text-gray-100 mb-2">
          {formatTime(elapsed)}
        </div>
        {currentEntry?.task_id && (
          <div className="text-sm text-gray-400">
            {tasks.find((t) => t.id === currentEntry.task_id)?.title || 'Tracking...'}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-3 mb-4">
        {!isRunning ? (
          <Button onClick={() => startTimer()} size="lg">
            Start Tracking
          </Button>
        ) : (
          <Button onClick={stopTimer} variant="danger" size="lg">
            Stop
          </Button>
        )}
      </div>

      {isRunning && (
        <div className="mt-4 border-t border-gray-800 pt-4">
          <p className="text-xs text-gray-500 mb-2">Quick task switch:</p>
          <div className="flex flex-wrap gap-2">
            {activeTasks.slice(0, 5).map((t) => (
              <button
                key={t.id}
                onClick={() => startTimer(t.id)}
                className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors truncate max-w-[150px]"
                title={t.title}
              >
                {t.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
