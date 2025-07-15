import React from 'react';
import { Button } from '@/components/ui/button';
import { verifyAuth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import BellButton from '@/components/training/BellButton';

export default async function TrainingPage() {
  const result = await verifyAuth();

  if (!result.user) {
    return redirect('/');
  }

  return (
    <section>
      <h1>Training Page</h1>
      <BellButton />
      <Button
        variant="outline"
        className="text-white bg-teal-500 hover:bg-teal-300 hover:text-white cursor-pointer"
      >
        Nueva rutina
      </Button>
    </section>
  );
}
