import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target } from 'lucide-react';
import type { SegmentType } from '../../interfaces';

interface SegmentHeaderProps {
  type: SegmentType;
  segmentTitle: string;
  trainingTitle: string;
  currentRound: number;
  totalRounds: number;
}

export default function SegmentHeader({
  type,
  segmentTitle,
  trainingTitle,
  currentRound,
  totalRounds,
}: SegmentHeaderProps) {
  return (
    <CardHeader className="pb-3 text-center space-y-1">
      <div className="flex flex-col items-center gap-2">
        {type === 'rest' && (
          <span className="text-[11px] font-bold uppercase tracking-widest text-orange-200 bg-orange-950/80 border border-orange-700/50 px-3 py-0.5 rounded-full">
            Descanso
          </span>
        )}
        <div className="flex items-center justify-center gap-2">
          {type === 'round' ? (
            <Target className="h-5 w-5 text-emerald-400" aria-hidden />
          ) : (
            <Clock className="h-5 w-5 text-orange-400" aria-hidden />
          )}
          <CardTitle
            className={`text-sm font-semibold uppercase tracking-wide ${
              type === 'round' ? 'text-emerald-300' : 'text-orange-300'
            }`}
          >
            {segmentTitle}
          </CardTitle>
        </div>
      </div>

      <CardDescription className="text-xs text-zinc-400">
        {trainingTitle}
        {type === 'rest' && (
          <>
            {' '}
            — Siguiente: round {currentRound + 1}/{totalRounds}
          </>
        )}
      </CardDescription>
    </CardHeader>
  );
}
