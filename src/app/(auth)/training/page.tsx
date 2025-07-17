import React from 'react';
import { Button } from '@/components/ui/button';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import SoundButton from '@/components/training/SoundButton';
import CountdownTimer from '@/components/training/CountdownTimer/CountdownTimer';

export default async function TrainingPage() {
  const result = await verifyAuth();

  if (!result.user) {
    return redirect('/');
  }

  return (
    <section>
      <h1>Training Page</h1>
      <div className="flex justify-center items-center h-screen">
        <CountdownTimer initialMinutes={0} initialSeconds={4} />
      </div>
      <SoundButton soundSrc="/sounds/boxing-bell.ogg" />
      <Button
        variant="outline"
        className="text-white bg-teal-500 hover:bg-teal-300 hover:text-white cursor-pointer"
      >
        Nueva rutina
      </Button>
    </section>
  );
}
