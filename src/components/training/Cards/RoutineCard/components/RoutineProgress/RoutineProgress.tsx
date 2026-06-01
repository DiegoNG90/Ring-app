import { getSegmentStepLabel } from '../../helpers';
import type { RoutineSegment } from '../../interfaces';

interface RoutineProgressProps {
  sequence: RoutineSegment[];
  currentCard: number;
  /** HIIT: número de ciclo/repetición (1-based). Reemplaza "Round N" por "Ciclo N". */
  cycleNumber?: number;
}

export default function RoutineProgress({
  sequence,
  currentCard,
  cycleNumber,
}: RoutineProgressProps) {
  const active = sequence[currentCard];
  const label = active ? getSegmentStepLabel(active, cycleNumber) : null;

  return (
    <div className="text-center space-y-1.5">
      {label && (
        <p className={`text-base font-semibold ${label.colorClass}`}>
          {label.text}
        </p>
      )}
      <p className="text-sm text-zinc-400">
        Paso {currentCard + 1} de {sequence.length}
      </p>
    </div>
  );
}
