import React from 'react';
import { Button } from '@/components/ui/button';
import { verifyAuth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import CountdownTimer from '@/components/training/CountdownTimer/CountdownTimer';
import { getAllTrainingsByUserId } from '@/lib/repositories/trainings';
import Link from 'next/link';
import { Training } from '@/types/Trainings';

export default async function TrainingPage() {
  const result = await verifyAuth();

  if (!result.user) {
    return redirect('/');
  }

  const trainings: Training[] = getAllTrainingsByUserId(1);

  console.log('trainings', trainings);
  return (
    <section>
      <div className="flex justify-end items-center p-3">
        <Button
          variant="outline"
          className="text-white align-center bg-teal-500 hover:bg-teal-300 hover:text-white cursor-pointer"
        >
          Nueva rutina
        </Button>
      </div>

      <h1>Training Page</h1>

      <div className="flex justify-center items-center py-3">
        <CountdownTimer initialMinutes={0} initialSeconds={4} />
      </div>

      <h2>Listado de rutinas</h2>
      <ul>
        {trainings?.map(
          ({
            training_id,
            training_title,
          }: {
            training_id: number;
            training_title: string;
          }) => {
            const parsedTrainingTitle = training_title
              .replaceAll(' ', '-')
              .toLowerCase();

            return (
              <li key={training_id}>
                <Link href={`/training/${parsedTrainingTitle}`}>
                  {training_title}
                </Link>
              </li>
            );
          }
        )}
      </ul>
    </section>
  );
}
