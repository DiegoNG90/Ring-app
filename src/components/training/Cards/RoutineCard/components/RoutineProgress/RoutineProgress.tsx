import { getSegmentStepLabel } from '../../helpers';
import type { RoutineSegment } from '../../interfaces';

interface RoutineProgressProps {
  sequence: RoutineSegment[];
  currentCard: number;
}

export default function RoutineProgress({
  sequence,
  currentCard,
}: RoutineProgressProps) {
  const active = sequence[currentCard];
  const label = active ? getSegmentStepLabel(active) : null;

  return (
    <div className="text-center space-y-1.5">
      <p className="text-sm text-zinc-400">
        Paso {currentCard + 1} de {sequence.length}
      </p>
      {label && (
        <p className={`text-base font-semibold ${label.colorClass}`}>
          {label.text}
        </p>
      )}
    </div>
  );
}
