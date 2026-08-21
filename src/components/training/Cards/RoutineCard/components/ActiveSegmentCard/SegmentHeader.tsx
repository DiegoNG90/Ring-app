import { cn } from '@/lib/helpers/tailwind-styles';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target } from 'lucide-react';
import type { SegmentType } from '../../interfaces';

interface SegmentHeaderProps {
  type: SegmentType;
  segmentTitle: string;
  trainingTitle: string;
  currentRound: number;
  totalRounds: number;
  isExpanded?: boolean;
}

export default function SegmentHeader({
  type,
  segmentTitle,
  trainingTitle,
  currentRound,
  totalRounds,
  isExpanded = false,
}: SegmentHeaderProps) {
  return (
    <CardHeader
      className={cn('text-center space-y-1', isExpanded ? 'pb-1 pt-4' : 'pb-3')}
    >
      <div
        className={cn(
          'flex flex-col items-center',
          isExpanded ? 'gap-1' : 'gap-2',
        )}
      >
        {type === 'rest' && (
          <span className="text-[11px] font-bold uppercase tracking-widest text-orange-200 bg-orange-950/80 border border-orange-700/50 px-3 py-0.5 rounded-full">
            Descanso
          </span>
        )}
        <div className="flex items-center justify-center gap-2">
          {type === 'round' ? (
            <Target
              className={cn(
                'text-emerald-400',
                isExpanded ? 'h-4 w-4' : 'h-5 w-5',
              )}
              aria-hidden
            />
          ) : (
            <Clock
              className={cn(
                'text-orange-400',
                isExpanded ? 'h-4 w-4' : 'h-5 w-5',
              )}
              aria-hidden
            />
          )}
          <CardTitle
            className={cn(
              'font-semibold uppercase tracking-wide',
              isExpanded ? 'text-xs' : 'text-sm',
              type === 'round' ? 'text-emerald-300' : 'text-orange-300',
            )}
          >
            {segmentTitle}
          </CardTitle>
        </div>
      </div>

      {!isExpanded && (
        <CardDescription className="text-xs text-zinc-400">
          {trainingTitle}
          {type === 'rest' && (
            <>
              {' '}
              — Siguiente: round {currentRound + 1}/{totalRounds}
            </>
          )}
        </CardDescription>
      )}
    </CardHeader>
  );
}
