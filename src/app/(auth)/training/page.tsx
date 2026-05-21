import React from 'react';
import { Button } from '@/components/ui/button';
import { verifyAuth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getAllTrainingsByUserId } from '@/lib/repositories/trainings';

import { Training } from '@/types/Trainings';
import TrainingRoutinesList from '@/components/training/TrainingRoutinesList';

export default async function TrainingPage() {
  const result = await verifyAuth();

  if (!result.user) {
    return redirect('/');
  }

  const trainings: Training[] = getAllTrainingsByUserId(+result.user?.id);

  return (
    <section>
      <div className="flex justify-end items-center p-3">
        {/* FALTA LA FUNCIONALIDAD DE DESTE BOTTON! */}
        <Button
          variant="outline"
          className="text-white align-center bg-teal-500 hover:bg-teal-300 hover:text-white cursor-pointer"
          disabled // Sacar cuando esté la funcionalidad
        >
          Nueva rutina
        </Button>
      </div>

      <h1>Training Page</h1>

      <TrainingRoutinesList trainings={trainings} />
    </section>
  );
}
