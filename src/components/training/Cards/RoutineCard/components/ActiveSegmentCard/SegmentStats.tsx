import { formatTime } from '../../helpers';
import type { SegmentType } from '../../interfaces';

interface SegmentStatsProps {
  type: SegmentType;
  durationSeconds: number;
  restSeconds: number;
}

export default function SegmentStats({
  type,
  durationSeconds,
  restSeconds,
}: SegmentStatsProps) {
  if (type === 'round') {
    return (
      <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400">
        <div>
          <div className="font-medium text-zinc-200">Este round</div>
          <div>{formatTime(durationSeconds)}</div>
        </div>
        <div>
          <div className="font-medium text-zinc-200">Descanso próximo</div>
          <div>{restSeconds > 0 ? formatTime(restSeconds) : '—'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400">
      <div>
        <div className="font-medium text-orange-300/90">Este descanso</div>
        <div>{formatTime(restSeconds)}</div>
      </div>
      <div>
        <div className="font-medium text-orange-300/90">Siguiente round</div>
        <div>{formatTime(durationSeconds)}</div>
      </div>
    </div>
  );
}
