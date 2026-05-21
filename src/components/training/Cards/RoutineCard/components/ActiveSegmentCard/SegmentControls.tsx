import type { SegmentType } from '../../interfaces';

interface SegmentControlsProps {
  type: SegmentType;
  hasStarted: boolean;
  cardKey: number;
  isRunning: boolean;
  isPaused: boolean;
  onToggle: () => void;
  onReset: () => void;
}

export default function SegmentControls({
  type,
  hasStarted,
  cardKey,
  isRunning,
  isPaused,
  onToggle,
  onReset,
}: SegmentControlsProps) {
  const toggleLabel =
    !hasStarted && cardKey === 0
      ? 'Empezar'
      : isRunning && !isPaused
        ? 'Pausar'
        : 'Reanudar';

  const toggleClass =
    !hasStarted && cardKey === 0
      ? type === 'round'
        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
        : 'bg-orange-600 hover:bg-orange-500 text-white'
      : isRunning && !isPaused
        ? 'bg-red-600 hover:bg-red-500 text-white'
        : type === 'round'
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
          : 'bg-orange-600 hover:bg-orange-500 text-white';

  return (
    <div className="flex justify-center gap-3 pt-2">
      <button
        type="button"
        onClick={onToggle}
        className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${toggleClass}`}
      >
        {toggleLabel}
      </button>

      <button
        type="button"
        onClick={onReset}
        className="px-4 py-2 rounded-full text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
      >
        Reset
      </button>
    </div>
  );
}
