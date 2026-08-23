'use client';

import { useCallback, useEffect, useState } from 'react';
import RoutineCard from '@/components/training/Cards/RoutineCard';
import { useKeepScreenOnPreference } from '@/hooks/useKeepScreenOnPreference';
import { useWakeLock } from '@/hooks/useWakeLock';
import type { Training } from '@/types/Trainings';

const EXIT_ANIMATION_MS = 500;

export interface RepeatedRoutineProps {
  training: Training;
}

export interface RoutineSessionProps {
  keepScreenOn: boolean;
  onKeepScreenOnChange: (keepScreenOn: boolean) => void;
  screenLockActive: boolean;
  onSessionStart: () => void;
  onSessionPausedChange: (paused: boolean) => void;
  onSessionReset: () => void;
  onSessionFinished: () => void;
}

export default function RepeatedRoutine({ training }: RepeatedRoutineProps) {
  const reps = Math.floor(training.repetitions);
  const { keepScreenOn, setKeepScreenOn } = useKeepScreenOnPreference();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [sessionFinished, setSessionFinished] = useState(false);

  const { isActive: screenLockActive } = useWakeLock({
    enabled:
      keepScreenOn && sessionStarted && !sessionPaused && !sessionFinished,
  });

  const handleSessionStart = useCallback(() => {
    setSessionStarted(true);
    setSessionFinished(false);
  }, []);

  const handleSessionPausedChange = useCallback((paused: boolean) => {
    setSessionPaused(paused);
  }, []);

  const handleSessionReset = useCallback(() => {
    setSessionStarted(false);
    setSessionPaused(false);
    setSessionFinished(false);
  }, []);

  const handleSessionFinished = useCallback(() => {
    setSessionFinished(true);
    setSessionStarted(false);
    setSessionPaused(false);
  }, []);

  const sessionProps: RoutineSessionProps = {
    keepScreenOn,
    onKeepScreenOnChange: setKeepScreenOn,
    screenLockActive,
    onSessionStart: handleSessionStart,
    onSessionPausedChange: handleSessionPausedChange,
    onSessionReset: handleSessionReset,
    onSessionFinished: handleSessionFinished,
  };

  if (reps <= 1) {
    return <RoutineCard training={training} {...sessionProps} />;
  }

  return (
    <RepeatedRoutineStack
      training={training}
      reps={reps}
      sessionProps={sessionProps}
      onAllLapsFinished={handleSessionFinished}
    />
  );
}

function RepeatedRoutineStack({
  training,
  reps,
  sessionProps,
  onAllLapsFinished,
}: {
  training: Training;
  reps: number;
  sessionProps: RoutineSessionProps;
  onAllLapsFinished: () => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);

  const isFullyComplete = activeIndex >= reps;

  const handleLapComplete = useCallback((lapIndex: number) => {
    setExitingIndex(lapIndex);

    window.setTimeout(() => {
      setActiveIndex(lapIndex + 1);
      setExitingIndex(null);
    }, EXIT_ANIMATION_MS);
  }, []);

  useEffect(() => {
    if (!isFullyComplete) return;
    onAllLapsFinished();
  }, [isFullyComplete, onAllLapsFinished]);

  if (isFullyComplete) {
    return (
      <p className="text-center text-emerald-400 font-medium py-8">
        ¡Felicidades, has terminado la rutina!
      </p>
    );
  }

  const visibleIndices = Array.from({ length: reps }, (_, i) => i).filter(
    (i) => i >= activeIndex || i === exitingIndex,
  );

  return (
    <div className="flex flex-col gap-2">
      {visibleIndices.map((lapIndex) => {
        const isExiting = exitingIndex === lapIndex;
        const isActive = lapIndex === activeIndex && !isExiting;

        return (
          <div
            key={lapIndex}
            className={
              isExiting
                ? 'max-h-0 opacity-0 -translate-y-4 overflow-hidden transition-all duration-500 ease-out pointer-events-none'
                : 'max-h-[3000px] overflow-hidden transition-all duration-500 ease-out'
            }
          >
            <RoutineCard
              training={training}
              disabled={!isActive}
              cycleNumber={lapIndex + 1}
              autoStart={isActive && activeIndex > 0}
              trailingRest={lapIndex < reps - 1}
              onComplete={
                isActive ? () => handleLapComplete(lapIndex) : undefined
              }
              {...sessionProps}
            />
          </div>
        );
      })}
    </div>
  );
}
