'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Training } from '@/types/Trainings';
import { Sound } from '@/lib/utils/sound';
import ActiveSegmentCard from './components/ActiveSegmentCard/ActiveSegmentCard';
import ProgressBar from './components/ProgressBar/ProgressBar';
import RoutineProgress from './components/RoutineProgress/RoutineProgress';
import { buildRoutineSegments } from './helpers';
import type { RoutineSegment } from './interfaces';

export interface RoutineCardProps {
  training: Training;
}

export default function RoutineCard({ training }: RoutineCardProps) {
  const totalRounds = Math.max(0, Math.floor(training.round_number));

  const [sequence] = useState<RoutineSegment[]>(() =>
    buildRoutineSegments(totalRounds, training.rest_seconds),
  );

  const [currentCard, setCurrentCard] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);

  const bellSound = useMemo(
    () => new Sound('/sounds/boxing-bell-liviano.mp3', 0.5),
    [],
  );

  const woodSound = useMemo(
    () => new Sound('/sounds/maderas_pre_fin_round.mpeg', 1),
    [],
  );

  const handleStart = useCallback(() => {
    bellSound.play();
    setHasStarted(true);
  }, [bellSound]);

  const stopAllSounds = useCallback(() => {
    bellSound.stop();
    woodSound.stop();
  }, [bellSound, woodSound]);

  const handlePause = useCallback(() => {
    stopAllSounds();
  }, [stopAllSounds]);

  const handleReset = useCallback(() => {
    stopAllSounds();
    setCurrentCard(0);
    setHasStarted(false);
  }, [stopAllSounds]);

  const handleSegmentComplete = useCallback(() => {
    bellSound.play();
    setCurrentCard((prev) => prev + 1);
  }, [bellSound]);

  const handlePreFinish = useCallback(() => {
    woodSound.play();
  }, [woodSound]);

  const isFinished = sequence.length > 0 && currentCard >= sequence.length;

  useEffect(() => {
    if (!isFinished) return;
    const t = setTimeout(() => {
      setCurrentCard(0);
      setHasStarted(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [isFinished]);

  if (totalRounds < 1) {
    return (
      <p className="text-sm text-zinc-400">
        Esta rutina no tiene rounds configurados (revisa `round_number` en la
        base de datos).
      </p>
    );
  }

  if (sequence.length === 0) {
    return (
      <p className="text-sm text-zinc-400">
        No se pudo armar la secuencia de la rutina.
      </p>
    );
  }

  if (isFinished) {
    return (
      <p className="text-center text-emerald-400 font-medium py-8">
        ¡Rutina completada! Reiniciando…
      </p>
    );
  }

  const active = sequence[currentCard];
  if (!active) return null;

  return (
    <div className="space-y-6">
      <RoutineProgress sequence={sequence} currentCard={currentCard} />

      <ActiveSegmentCard
        key={`${active.type}-${active.round}-${currentCard}`}
        training={training}
        type={active.type}
        currentRound={active.round}
        totalRounds={totalRounds}
        onComplete={handleSegmentComplete}
        onPreFinish={handlePreFinish}
        cardKey={currentCard}
        hasStarted={hasStarted}
        onStart={handleStart}
        onReset={handleReset}
        onPause={handlePause}
      />

      <ProgressBar sequence={sequence} currentCard={currentCard} />
    </div>
  );
}

export { buildRoutineSegments } from './helpers';
export type { RoutineSegment } from './interfaces';
