'use client';

import { useCallback, useState } from 'react';
import RoutineCard from '@/components/training/Cards/RoutineCard';
import type { Training } from '@/types/Trainings';

const EXIT_ANIMATION_MS = 500;

export interface RepeatedRoutineProps {
  training: Training;
}

export default function RepeatedRoutine({ training }: RepeatedRoutineProps) {
  const reps = Math.floor(training.repetitions);

  if (reps <= 1) {
    return <RoutineCard training={training} />;
  }

  return <RepeatedRoutineStack training={training} reps={reps} />;
}

function RepeatedRoutineStack({
  training,
  reps,
}: {
  training: Training;
  reps: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [exitingIndex, setExitingIndex] = useState<number | null>(null);

  const isFullyComplete = activeIndex >= reps;

  const handleLapComplete = useCallback(
    (lapIndex: number) => {
      setExitingIndex(lapIndex);

      window.setTimeout(() => {
        setActiveIndex(lapIndex + 1);
        setExitingIndex(null);
      }, EXIT_ANIMATION_MS);
    },
    [],
  );

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
              onComplete={
                isActive ? () => handleLapComplete(lapIndex) : undefined
              }
            />
          </div>
        );
      })}
    </div>
  );
}
