'use client';
import React from 'react';

import { Button } from '@/components/ui/button';

function BellButton() {
  const playBell = () => {
    const audio = new Audio('/sounds/boxing-bell.ogg');
    audio.play().catch(console.error);
    audio.volume = 0.5;
  };

  return (
    <Button variant="destructive" onClick={playBell}>
      Ring!
    </Button>
  );
}

export default BellButton;
