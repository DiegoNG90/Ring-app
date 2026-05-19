'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Clock, Target } from 'lucide-react';
import type { Training } from '@/types/Trainings';
import { Sound } from '@/lib/utils/sound';

type SegmentType = 'round' | 'rest';

export interface RoutineSegment {
  type: SegmentType;
  round: number;
}

/** Round1 → (descanso?)* → Round2 → … Solo inserta descansos si hay segundos de descanso. */
export function buildRoutineSegments(
  totalRounds: number,
  restSeconds: number,
): RoutineSegment[] {
  const segments: RoutineSegment[] = [];
  const hasRest = restSeconds > 0;

  for (let i = 1; i <= totalRounds; i++) {
    segments.push({ type: 'round', round: i });
    if (hasRest && i < totalRounds) {
      segments.push({ type: 'rest', round: i });
    }
  }

  return segments;
}

function getSegmentStepLabel(segment: RoutineSegment): {
  text: string;
  colorClass: string;
} {
  if (segment.type === 'round') {
    return {
      text: `Round ${segment.round}`,
      colorClass: 'text-emerald-400',
    };
  }
  return {
    text: 'Descanso',
    colorClass: 'text-orange-400',
  };
}

interface ProgressBarProps {
  sequence: RoutineSegment[];
  currentCard: number;
}

function ProgressBar({ sequence, currentCard }: ProgressBarProps) {
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

interface RoutineProgressProps {
  sequence: RoutineSegment[];
  currentCard: number;
}

function RoutineProgress({ sequence, currentCard }: RoutineProgressProps) {
  const active = sequence[currentCard];
  const label = active ? getSegmentStepLabel(active) : null;

  return (
    <div className="text-center space-y-1.5">
      <p className="text-sm text-zinc-400">
        Paso {currentCard + 1} de {sequence.length}
      </p>
      {label && (
        <p className={`text-base font-semibold ${label.colorClass}`}>
          {label.text}
        </p>
      )}
    </div>
  );
}

interface ActiveSegmentProps {
  training: Pick<
    Training,
    'training_title' | 'duration_seconds' | 'rest_seconds'
  >;
  type: SegmentType;
  currentRound: number;
  totalRounds: number;
  onComplete?: () => void;
  onPreFinish?: () => void;
  cardKey: number;
  hasStarted: boolean;
  onStart?: () => void;
  onReset?: (segmentIndex: number) => void;
  onPause?: () => void;
  onSegmentStartBell?: () => void;
}

function ActiveSegmentCard({
  training,
  type,
  currentRound,
  totalRounds,
  onComplete,
  onPreFinish,
  cardKey,
  hasStarted,
  onStart,
  onReset,
  onPause,
  onSegmentStartBell,
}: ActiveSegmentProps) {
  const totalTime =
    type === 'round' ? training.duration_seconds : training.rest_seconds;

  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const completionFired = useRef(false);
  const preFinishFired = useRef(false);
  const segmentStartBellPending = useRef(false);

  useEffect(() => {
    completionFired.current = false;
    preFinishFired.current = false;
    segmentStartBellPending.current = false;
  }, [cardKey]);

  useEffect(() => {
    setTimeLeft(totalTime);
    if (hasStarted) {
      setIsRunning(true);
      setIsPaused(false);
    } else {
      setIsRunning(false);
      setIsPaused(false);
    }
  }, [cardKey, totalTime, hasStarted]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isRunning && timeLeft > 0 && !isPaused) {
      interval = setInterval(() => {
        setTimeLeft((time) => (time <= 0 ? 0 : time - 1));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, isPaused]);

  useEffect(() => {
    if (
      type === 'round' &&
      totalTime > 10 &&
      timeLeft === 10 &&
      !preFinishFired.current
    ) {
      preFinishFired.current = true;
      onPreFinish?.();
    }
  }, [timeLeft, type, totalTime, onPreFinish]);

  useEffect(() => {
    if (totalTime <= 0 || timeLeft !== 0 || completionFired.current) return;
    completionFired.current = true;
    queueMicrotask(() => onComplete?.());
  }, [timeLeft, onComplete, totalTime]);

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

  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const isCompleted = timeLeft === 0;

  const playPendingSegmentStartBell = () => {
    if (!segmentStartBellPending.current) return;
    segmentStartBellPending.current = false;
    onSegmentStartBell?.();
  };

  const toggleTimer = () => {
    if (isCompleted) return;

    if (!hasStarted && cardKey === 0) {
      segmentStartBellPending.current = false;
      onStart?.();
      setIsRunning(true);
      setIsPaused(false);
      return;
    }

    if (isRunning && !isPaused) {
      onPause?.();
      setIsPaused(true);
    } else {
      playPendingSegmentStartBell();
      setIsPaused(false);
      setIsRunning(true);
    }
  };

  const resetTimer = () => {
    setTimeLeft(totalTime);
    setIsRunning(false);
    setIsPaused(false);
    completionFired.current = false;
    preFinishFired.current = false;
    onReset?.(cardKey);
    // Tras reset en el primer paso, onStart vuelve a disparar la campana.
    // En pasos siguientes, la campana suena al reanudar manualmente.
    segmentStartBellPending.current = cardKey > 0;
  };

  const segmentTitle =
    type === 'round'
      ? `Round ${currentRound}/${totalRounds}`
      : `Descanso · después del round ${currentRound}`;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const surfaceRound =
    'border-l-4 border-l-emerald-500 bg-gradient-to-br from-zinc-800 via-zinc-800 to-zinc-900 border border-zinc-700/80 text-zinc-100';
  const surfaceRest =
    'border-l-4 border-l-orange-500 bg-gradient-to-br from-zinc-800 via-zinc-900 to-zinc-950 border border-orange-900/40 text-zinc-100 ring-1 ring-orange-500/30';

  return (
    <Card
      className={`w-full max-w-sm mx-auto transition-colors duration-300 shadow-lg ${
        type === 'round' ? surfaceRound : surfaceRest
      } ${isCompleted ? 'opacity-90' : ''}`}
      data-segment-type={type}
    >
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
          {training.training_title}
          {type === 'rest' && (
            <>
              {' '}
              — Siguiente: round {currentRound + 1}/{totalRounds}
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <div className="relative">
          <div
            className={`text-4xl font-mono font-bold tabular-nums ${
              isCompleted
                ? 'text-zinc-500'
                : type === 'round'
                  ? 'text-emerald-400'
                  : 'text-orange-400'
            }`}
          >
            {formatTime(timeLeft)}
          </div>

          <div className="mt-3 w-full bg-zinc-700/80 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                type === 'round' ? 'bg-emerald-500' : 'bg-orange-500'
              }`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>

        {type === 'round' ? (
          <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400">
            <div>
              <div className="font-medium text-zinc-200">Este round</div>
              <div>{formatTime(training.duration_seconds)}</div>
            </div>
            <div>
              <div className="font-medium text-zinc-200">Descanso próximo</div>
              <div>
                {training.rest_seconds > 0
                  ? formatTime(training.rest_seconds)
                  : '—'}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-xs text-zinc-400">
            <div>
              <div className="font-medium text-orange-300/90">Este descanso</div>
              <div>{formatTime(training.rest_seconds)}</div>
            </div>
            <div>
              <div className="font-medium text-orange-300/90">Siguiente round</div>
              <div>{formatTime(training.duration_seconds)}</div>
            </div>
          </div>
        )}

        <div className="flex justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={toggleTimer}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-colors ${
              !hasStarted && cardKey === 0
                ? type === 'round'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-orange-600 hover:bg-orange-500 text-white'
                : isRunning && !isPaused
                  ? 'bg-red-600 hover:bg-red-500 text-white'
                  : type === 'round'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-orange-600 hover:bg-orange-500 text-white'
            }`}
          >
            {!hasStarted && cardKey === 0
              ? 'Empezar'
              : isRunning && !isPaused
                ? 'Pausar'
                : 'Reanudar'}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className="px-4 py-2 rounded-full text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-zinc-100 transition-colors"
          >
            Reset
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

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
    () => new Sound('/sounds/maderas_pre_fin_round.mpeg', 0.5),
    [],
  );

  const handleStart = useCallback(() => {
    bellSound.play();
    setHasStarted(true);
  }, [bellSound]);

  const handleSegmentStartBell = useCallback(() => {
    bellSound.play();
  }, [bellSound]);

  const stopAllSounds = useCallback(() => {
    bellSound.stop();
    woodSound.stop();
  }, [bellSound, woodSound]);

  const handlePause = useCallback(() => {
    stopAllSounds();
  }, [stopAllSounds]);

  const handleReset = useCallback(
    (segmentIndex: number) => {
      stopAllSounds();
      if (segmentIndex === 0) {
        setHasStarted(false);
      }
    },
    [stopAllSounds],
  );

  const handleSegmentComplete = useCallback(() => {
    bellSound.play();
    setCurrentCard((prev) => prev + 1);
  }, [bellSound]);

  const handlePreFinish = useCallback(() => {
    woodSound.play();
  }, [woodSound]);

  const isFinished =
    sequence.length > 0 && currentCard >= sequence.length;

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
        Esta rutina no tiene rounds configurados (revisa `round_number` en la base
        de datos).
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
        onSegmentStartBell={handleSegmentStartBell}
      />

      <ProgressBar sequence={sequence} currentCard={currentCard} />
    </div>
  );
}
