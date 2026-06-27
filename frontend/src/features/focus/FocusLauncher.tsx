import { useState } from 'react';
import { Modal, Button } from '../../components/ui';
import { useFocusStore } from '../../stores/focusStore';
import { useTaskStore } from '../../stores/taskStore';

const MODES = [
  { id: 'pomodoro', label: 'Pomodoro', desc: '25 min focus + 5 min break', duration: 25 * 60 },
  { id: 'deep_work', label: 'Deep Work', desc: '90 min uninterrupted', duration: 90 * 60 },
  { id: 'free', label: 'Free', desc: 'Start and stop anytime', duration: 0 },
];

export function FocusLauncher() {
  const [open, setOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('pomodoro');
  const [customDuration, setCustomDuration] = useState(25);
  const { startSession } = useFocusStore();
  const { tasks } = useTaskStore();

  const handleStart = () => {
    const mode = MODES.find((m) => m.id === selectedMode)!;
    const duration = selectedMode === 'free' ? 0 : customDuration * 60;
    startSession(undefined, mode.id, duration || mode.duration);
    setOpen(false);
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} variant="secondary" size="lg" className="w-full">
        Start Focus Session
      </Button>

      <Modal open={open} onClose={() => setOpen(false)} title="New Focus Session">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`p-3 rounded-lg text-center text-sm border transition-colors ${
                  selectedMode === m.id
                    ? 'border-brand-500 bg-brand-600/10 text-brand-400'
                    : 'border-gray-800 text-gray-400 hover:border-gray-700'
                }`}
              >
                <div className="font-medium">{m.label}</div>
                <div className="text-xs mt-1 opacity-70">{m.desc}</div>
              </button>
            ))}
          </div>

          {selectedMode !== 'free' && (
            <div>
              <label className="text-sm text-gray-400 block mb-1">Duration (minutes)</label>
              <input
                type="number"
                value={customDuration}
                onChange={(e) => setCustomDuration(Number(e.target.value))}
                min={5}
                max={180}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleStart}>Start</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
