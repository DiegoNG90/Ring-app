'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
import { useBodyScrollLock } from '@/hooks/useBodyScrollLock';
import { useKeepScreenOnPreference } from '@/hooks/useKeepScreenOnPreference';
import { useLandscapeExpanded } from '@/hooks/useLandscapeExpanded';
import { cn } from '@/lib/helpers/tailwind-styles';
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
  const { keepScreenOn, setKeepScreenOn } = useKeepScreenOnPreference();

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

  const handleInterval = useCallback(() => {
    if (disabled) return;
    bellSound.play();
  }, [bellSound, disabled]);

  const isFinished = sequence.length > 0 && currentCard >= sequence.length;

  const { isExpanded, expand, dismiss } = useLandscapeExpanded({
    hasStarted,
    disabled,
    isFinished,
  });

  const fullscreenToggleClassName =
    'inline-flex items-center gap-2 rounded-md border border-zinc-700 bg-zinc-900/90 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500';

  useBodyScrollLock(isExpanded);

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
    <div
      className={cn(
        hasStarted && !isExpanded && 'pr-12',
        isExpanded ? 'space-y-3' : 'space-y-6',
      )}
    >
      {!isExpanded && (
        <RoutineProgress
          sequence={sequence}
          currentCard={currentCard}
          cycleNumber={cycleNumber}
        />
      )}

      <ActiveSegmentCard
        key={`${active.type}-${active.round}-${currentCard}`}
        training={training}
        type={active.type}
        currentRound={active.round}
        totalRounds={totalRounds}
        onComplete={handleSegmentComplete}
        onPreFinish={handlePreFinish}
        onInterval={handleInterval}
        cardKey={currentCard}
        hasStarted={hasStarted}
        onStart={handleStart}
        onReset={handleReset}
        onPause={handlePause}
        keepScreenOn={keepScreenOn}
        onKeepScreenOnChange={setKeepScreenOn}
        isExpanded={isExpanded}
      />

      {!isExpanded && (
        <ProgressBar sequence={sequence} currentCard={currentCard} />
      )}
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

  return (
    <div
      className={cn(
        'relative',
        isExpanded &&
          'fixed inset-0 z-[60] flex min-h-dvh flex-col overflow-hidden bg-zinc-950 motion-safe:transition-[background-color] motion-safe:duration-300',
      )}
      data-landscape-expanded={isExpanded ? 'true' : undefined}
    >
      {hasStarted && (
        <div
          className={cn(
            'z-10 flex justify-end',
            isExpanded
              ? 'shrink-0 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]'
              : 'absolute right-0 top-0',
          )}
        >
          <button
            type="button"
            onClick={isExpanded ? dismiss : expand}
            className={fullscreenToggleClassName}
            aria-label={
              isExpanded ? 'Salir de pantalla completa' : 'Pantalla completa'
            }
          >
            {isExpanded ? (
              <>
                <Minimize2 className="h-4 w-4" aria-hidden="true" />
                <span className="sr-only sm:not-sr-only">Salir</span>
              </>
            ) : (
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      )}

      <div
        className={cn(
          isExpanded &&
            'flex min-h-0 flex-1 flex-col justify-center overflow-hidden px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        )}
      >
        {content}
      </div>
    </div>
  );
}

export { buildRoutineSegments } from './helpers';
export type { RoutineSegment } from './interfaces';
