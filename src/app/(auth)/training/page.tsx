'use client';
import React from 'react';
export default function TrainingPage() {
  const playBell = () => {
    const audio = new Audio('/sounds/boxing-bell.ogg');
    audio.play().catch(console.error);
    audio.volume = 0.5; // Esto funciona!
  };
  return (
    <section>
      <h1>Training Page</h1>
      <button onClick={playBell}>Ring!</button>
    </section>
  );
}
