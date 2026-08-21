import { formatTime } from '../../helpers';
import type { SegmentType } from '../../interfaces';

interface SegmentTimerProps {
  type: SegmentType;
  timeLeft: number;
  progress: number;
  isCompleted: boolean;
  isExpanded?: boolean;
}

export default function SegmentTimer({
  type,
  timeLeft,
  progress,
  isCompleted,
  isExpanded = false,
}: SegmentTimerProps) {
  return (
    <div className="relative">
      <div
        className={`font-mono font-bold tabular-nums ${
          isExpanded ? 'text-5xl sm:text-6xl' : 'text-4xl'
        } ${
          isCompleted
            ? 'text-zinc-500'
            : type === 'round'
              ? 'text-emerald-400'
              : 'text-orange-400'
        }`}
      >
        {formatTime(timeLeft)}
      </div>

      <div
        className={`w-full bg-zinc-700/80 rounded-full ${
          isExpanded ? 'mt-2 h-2' : 'mt-3 h-2'
        }`}
      >
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            type === 'round' ? 'bg-emerald-500' : 'bg-orange-500'
          }`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}
