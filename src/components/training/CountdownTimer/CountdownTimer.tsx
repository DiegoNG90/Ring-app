'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button'; // shadcn/ui

interface CountdownTimerProps {
  initialMinutes?: number;
  initialSeconds: number;
  onComplete?: () => void;
}

import { Sound } from '@/lib/sound';

const BellSound = new Sound('/sounds/boxing-bell.ogg', 0.3);
const TripleBellSound = new Sound('/sounds/boxing-triple-bells.ogg', 0.1);

export default function CountdownTimer({
  initialMinutes = 0,
  initialSeconds,
  onComplete,
}: CountdownTimerProps) {
  const initialTime = (initialMinutes * 60 + initialSeconds) * 1000;

  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (initialSeconds > 5 && prev === 5000) {
            TripleBellSound.play();
          }
          if (prev <= 10) {
            if (onComplete) onComplete();
            BellSound.play();
            setIsRunning(false);
            return 0;
          }
          return prev - 10;
        });
      }, 10);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onComplete, initialSeconds]);

  const handleToggle = () => {
    if (timeLeft === 0 && !isRunning) {
      setTimeLeft(initialTime);
      setIsRunning(true);
      return;
    }
    setIsRunning((prev) => !prev);
  };

  const handleStop = () => {
    setIsRunning(false);
    setTimeLeft(initialTime);
    BellSound.stop();
    TripleBellSound.stop();
  };

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const milliseconds = Math.floor((timeLeft % 1000) / 10);

  return (
    <div className="bg-black text-white rounded-lg p-4 text-center font-mono space-y-4 w-80">
      <div>
        {initialMinutes !== 0 && (
          <span className="text-4xl">{String(minutes).padStart(2, '0')}:</span>
        )}
        <span className="text-4xl">{String(seconds).padStart(2, '0')}:</span>
        <span className="text-2xl">
          {String(milliseconds).padStart(2, '0')}
        </span>
      </div>

      <div className="flex justify-center gap-4">
        <Button onClick={handleToggle} variant="secondary">
          {timeLeft === 0 && !isRunning && 'Restart'}
          {isRunning && timeLeft > 0 && 'Pause'}
          {!isRunning && timeLeft > 0 && 'Play'}
        </Button>
        <Button onClick={handleStop} variant="destructive">
          {timeLeft === 0 ? 'Reset' : 'Stop'}
        </Button>
      </div>
    </div>
  );
}
