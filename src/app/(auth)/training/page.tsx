import React from 'react';
import { verifyAuth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import {
  countUserCreatedRoutines,
  getAllTrainingsByUserId,
} from '@/lib/repositories/trainings';

import { Training } from '@/types/Trainings';
import { CreateRoutineButton } from '@/components/training/CreateRoutine/CreateRoutineButton';
import TrainingRoutinesList from '@/components/training/TrainingRoutinesList';

export default async function TrainingPage() {
  const result = await verifyAuth();

  if (!result.user) {
    return redirect('/');
  }

  const userId = +result.user?.id;
  const trainings: Training[] = getAllTrainingsByUserId(userId);
  const userCreatedCount = countUserCreatedRoutines(userId);

  return (
    <section>
      <div className="flex justify-end items-center p-3">
        <CreateRoutineButton userCreatedCount={userCreatedCount} />
      </div>

      <TrainingRoutinesList trainings={trainings} />
    </section>
  );
}
