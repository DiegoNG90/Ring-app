import { useCallback, useEffect, useRef, useState } from 'react';
import type { SegmentType } from '../../interfaces';

export interface UseSegmentTimerOptions {
  totalTime: number;
  type: SegmentType;
  cardKey: number;
  hasStarted: boolean;
  onComplete?: () => void;
  onPreFinish?: () => void;
  onStart?: () => void;
  onReset?: () => void;
  onPause?: () => void;
}

export interface UseSegmentTimerResult {
  timeLeft: number;
  isRunning: boolean;
  isPaused: boolean;
  progress: number;
  isCompleted: boolean;
  toggleTimer: () => void;
  resetTimer: () => void;
}

export function useSegmentTimer({
  totalTime,
  type,
  cardKey,
  hasStarted,
  onComplete,
  onPreFinish,
  onStart,
  onReset,
  onPause,
}: UseSegmentTimerOptions): UseSegmentTimerResult {
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const completionFired = useRef(false);
  const preFinishFired = useRef(false);

  useEffect(() => {
    completionFired.current = false;
    preFinishFired.current = false;
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

  const isCompleted = timeLeft === 0;
  const progress = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 0;

  const toggleTimer = useCallback(() => {
    if (isCompleted) return;

    if (!hasStarted && cardKey === 0) {
      onStart?.();
      setIsRunning(true);
      setIsPaused(false);
      return;
    }

    if (isRunning && !isPaused) {
      onPause?.();
      setIsPaused(true);
    } else {
      setIsPaused(false);
      setIsRunning(true);
    }
  }, [
    cardKey,
    hasStarted,
    isCompleted,
    isPaused,
    isRunning,
    onPause,
    onStart,
  ]);

  const resetTimer = useCallback(() => {
    onReset?.();
    if (cardKey > 0) return;

    setTimeLeft(totalTime);
    setIsRunning(false);
    setIsPaused(false);
    completionFired.current = false;
    preFinishFired.current = false;
  }, [cardKey, onReset, totalTime]);

  return {
    timeLeft,
    isRunning,
    isPaused,
    progress,
    isCompleted,
    toggleTimer,
    resetTimer,
  };
}
