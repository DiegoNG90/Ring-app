'use client';
import React from 'react';

import { Button } from '@/components/ui/button';
// import { playSound } from '@/lib/sound';

function SoundButton({ soundSrc }: { soundSrc: string }) {
  return (
    <Button
      variant="destructive"
      // onClick={() => playSound({ soundSrc: soundSrc, volume: 0.1 })} -> Reemplazar por nueva clase Sound en caso que usemos este btn
    >
      Ring!
    </Button>
  );
}

export default SoundButton;
