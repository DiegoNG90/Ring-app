'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/helpers/tailwind-styles';
import type { Training } from '@/types/Trainings';
import type { SegmentType } from '../../interfaces';
import SegmentControls from './SegmentControls';
import SegmentHeader from './SegmentHeader';
import SegmentStats from './SegmentStats';
import SegmentTimer from './SegmentTimer';
import { useSegmentTimer } from './useSegmentTimer';

export interface ActiveSegmentCardProps {
  training: Pick<
    Training,
    'training_title' | 'duration_seconds' | 'rest_seconds' | 'interval_seconds'
  >;
  type: SegmentType;
  currentRound: number;
  totalRounds: number;
  onComplete?: () => void;
  onPreFinish?: () => void;
  onInterval?: () => void;
  cardKey: number;
  hasStarted: boolean;
  onStart?: () => void;
  onReset?: () => void;
  onPause?: () => void;
  keepScreenOn?: boolean;
  onKeepScreenOnChange?: (keepScreenOn: boolean) => void;
  screenLockActive?: boolean;
  onSessionPausedChange?: (paused: boolean) => void;
  isExpanded?: boolean;
}

export default function ActiveSegmentCard({
  training,
  type,
  currentRound,
  totalRounds,
  onComplete,
  onPreFinish,
  onInterval,
  cardKey,
  hasStarted,
  onStart,
  onReset,
  onPause,
  keepScreenOn = true,
  onKeepScreenOnChange,
  screenLockActive = false,
  onSessionPausedChange,
  isExpanded = false,
}: ActiveSegmentCardProps) {
  const totalTime =
    type === 'round' ? training.duration_seconds : training.rest_seconds;

  const {
    timeLeft,
    isRunning,
    isPaused,
    progress,
    isCompleted,
    toggleTimer,
    resetTimer,
  } = useSegmentTimer({
    totalTime,
    type,
    cardKey,
    hasStarted,
    intervalSeconds:
      type === 'round' ? training.interval_seconds : undefined,
    onComplete,
    onPreFinish,
    onInterval,
    onStart,
    onReset,
    onPause,
  });

  useEffect(() => {
    onSessionPausedChange?.(isPaused);
  }, [isPaused, onSessionPausedChange]);

  const handleStartOrResume = (withScreenOn: boolean) => {
    onKeepScreenOnChange?.(withScreenOn);
    toggleTimer();
  };

  if (totalTime <= 0) {
    return (
      <Card className="max-w-sm mx-auto border-destructive/50 bg-zinc-900 text-zinc-100">
        <CardHeader>
          <CardTitle className="text-sm text-destructive">
            Duración no válida ({type === 'round' ? 'round' : 'descanso'}: 0s)
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const segmentTitle =
    type === 'round'
      ? `Round ${currentRound}/${totalRounds}`
      : `Descanso · después del round ${currentRound}`;

  const surfaceRound =
    'border-l-4 border-l-emerald-500 bg-gradient-to-br from-zinc-800 via-zinc-800 to-zinc-900 border border-zinc-700/80 text-zinc-100';
  const surfaceRest =
    'border-l-4 border-l-orange-500 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-orange-900/40 text-zinc-100 ring-1 ring-orange-500/30';

  return (
    <Card
      className={`w-full mx-auto transition-colors duration-300 shadow-lg ${
        isExpanded ? 'max-w-none' : 'max-w-sm'
      } ${
        type === 'round' ? surfaceRound : surfaceRest
      } ${isCompleted ? 'opacity-90' : ''}`}
      data-segment-type={type}
    >
      <SegmentHeader
        type={type}
        segmentTitle={segmentTitle}
        trainingTitle={training.training_title}
        currentRound={currentRound}
        totalRounds={totalRounds}
        isExpanded={isExpanded}
      />

      <CardContent
        className={cn('text-center', isExpanded ? 'space-y-2' : 'space-y-4')}
      >
        <SegmentTimer
          type={type}
          timeLeft={timeLeft}
          progress={progress}
          isCompleted={isCompleted}
          isExpanded={isExpanded}
        />

        {!isExpanded && (
          <SegmentStats
            type={type}
            durationSeconds={training.duration_seconds}
            restSeconds={training.rest_seconds}
          />
        )}

        <SegmentControls
          type={type}
          hasStarted={hasStarted}
          cardKey={cardKey}
          isRunning={isRunning}
          isPaused={isPaused}
          preferredKeepScreenOn={keepScreenOn}
          screenLockActive={screenLockActive}
          onPause={toggleTimer}
          onStartOrResume={handleStartOrResume}
          onReset={resetTimer}
        />
      </CardContent>
    </Card>
  );
}
