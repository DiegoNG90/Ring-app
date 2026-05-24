import type { RoutineSegment } from '../../interfaces';

interface ProgressBarProps {
  sequence: RoutineSegment[];
  currentCard: number;
}

export default function ProgressBar({ sequence, currentCard }: ProgressBarProps) {
  return (
    <div
      className="flex justify-center gap-2 flex-wrap"
      role="list"
      aria-label="Progreso de la rutina"
    >
      {sequence.map((seg, index) => {
        const isActive = index === currentCard;
        const isDone = index < currentCard;
        const isRound = seg.type === 'round';

        const dotClass = isRound
          ? isActive
            ? 'bg-emerald-500 scale-125 ring-2 ring-emerald-400/50'
            : isDone
              ? 'bg-emerald-600/80'
              : 'bg-zinc-600'
          : isActive
            ? 'bg-orange-500 scale-125 ring-2 ring-orange-400/50'
            : isDone
              ? 'bg-orange-600/80'
              : 'bg-zinc-600';

        return (
          <div
            key={`${seg.type}-${seg.round}-${index}`}
            role="listitem"
            title={isRound ? `Round ${seg.round}` : 'Descanso'}
            aria-current={isActive ? 'step' : undefined}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${dotClass}`}
          />
        );
      })}
    </div>
  );
}
