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
  /** Vista previa no interactiva (HIIT: repeticiones pendientes). */
  disabled?: boolean;
  /** Inicia el timer automáticamente al activarse (HIIT: vueltas 2+). */
  autoStart?: boolean;
  /** Modo controlado: al terminar el ciclo llama al padre en lugar de auto-reset. */
  onComplete?: () => void;
  /** HIIT: índice de ciclo/repetición mostrado en RoutineProgress (1-based). */
  cycleNumber?: number;
  /** HIIT: añade un descanso final tras el último round (ciclos no finales). */
  trailingRest?: boolean;
}

export default function RoutineCard({
  training,
  disabled = false,
  autoStart = false,
  onComplete,
  cycleNumber,
  trailingRest = false,
}: RoutineCardProps) {
  const totalRounds = Math.max(0, Math.floor(training.round_number));
  const isControlled = onComplete != null;

  const [sequence] = useState<RoutineSegment[]>(() =>
    buildRoutineSegments(totalRounds, training.rest_seconds, trailingRest),
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
    if (disabled) return;
    bellSound.play();
    setHasStarted(true);
  }, [bellSound, disabled]);

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
    if (disabled) return;
    bellSound.play();
    setCurrentCard((prev) => prev + 1);
  }, [bellSound, disabled]);

  const handlePreFinish = useCallback(() => {
    if (disabled) return;
    woodSound.play();
  }, [woodSound, disabled]);

  const isFinished = sequence.length > 0 && currentCard >= sequence.length;

  useEffect(() => {
    if (!disabled) return;
    stopAllSounds();
    setCurrentCard(0);
    setHasStarted(false);
  }, [disabled, stopAllSounds]);

  useEffect(() => {
    if (disabled || !autoStart || hasStarted) return;
    bellSound.play();
    setHasStarted(true);
  }, [autoStart, disabled, hasStarted, bellSound]);

  useEffect(() => {
    if (!isFinished || !isControlled) return;
    onComplete();
  }, [isFinished, isControlled, onComplete]);

  useEffect(() => {
    if (!isFinished || isControlled) return;
    const t = setTimeout(() => {
      setCurrentCard(0);
      setHasStarted(false);
    }, 2000);
    return () => clearTimeout(t);
  }, [isFinished, isControlled]);

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

  if (isFinished && isControlled) {
    return null;
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

  const content = (
    <div className="space-y-6">
      <RoutineProgress
        sequence={sequence}
        currentCard={currentCard}
        cycleNumber={cycleNumber}
      />

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

  if (disabled) {
    return (
      <div
        className="opacity-60 pointer-events-none select-none"
        aria-disabled="true"
      >
        {content}
      </div>
    );
  }

  return content;
}

export { buildRoutineSegments } from './helpers';
export type { RoutineSegment } from './interfaces';
