'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
import { playSound } from '@/lib/sound';

function SoundButton({ soundSrc }: { soundSrc: string }) {
  return (
    <Button
      variant="destructive"
      onClick={() => playSound({ soundSrc: soundSrc, volume: 0.1 })}
    >
      Ring!
    </Button>
  );
}

export default SoundButton;
