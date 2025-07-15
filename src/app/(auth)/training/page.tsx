'use client';
import React from 'react';
import { Button } from '@/components/ui/button';

export default function TrainingPage() {
  const playBell = () => {
    const audio = new Audio('/sounds/boxing-bell.ogg');
    audio.play().catch(console.error);
    audio.volume = 0.5;
  };
  return (
    <section>
      <h1>Training Page</h1>
      <Button variant="destructive" onClick={playBell}>
        Ring!
      </Button>
      <Button
        variant="outline"
        className="text-white bg-teal-500 hover:bg-teal-300 hover:text-white cursor-pointer"
      >
        Nueva rutina
      </Button>
    </section>
  );
}
