import { Modal, Button } from '../../components/ui';
import { useFocusStore } from '../../stores/focusStore';

export function SelfRating() {
  const { showRating, submitRating, dismissRating } = useFocusStore();

  if (!showRating) return null;

  return (
    <Modal open={showRating} onClose={dismissRating} title="专注自评">
      <div className="space-y-4">
        <p className="text-sm text-gray-400">这次专注你有多投入？</p>
        <div className="flex gap-2 justify-center">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => submitRating(rating)}
              className="w-12 h-12 rounded-full border border-gray-700 hover:border-brand-500 hover:bg-brand-600/10 text-lg font-medium text-gray-300 hover:text-brand-400 transition-all"
            >
              {rating}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-600 px-1">
          <span>分心</span>
          <span>深度心流</span>
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" onClick={dismissRating}>跳过</Button>
        </div>
      </div>
    </Modal>
  );
}
