import React from 'react';
import Link from 'next/link';

import RepeatedRoutine from '@/components/training/RepeatedRoutine';
import { verifyAuth } from '@/lib/auth/auth';
import { getTrainingByIdForUser } from '@/lib/repositories/trainings';
import { capitalize, normalizeUrlSlug } from '@/lib/utils/strings';
import { redirect } from 'next/navigation';

interface TrainingRutinePageProps {
  params: Promise<{ slug: string }>;
}

async function TrainingRutinePage({ params }: TrainingRutinePageProps) {
  const result = await verifyAuth();

  if (!result.user) {
    redirect('/');
  }

  const { slug } = await params;

  const parsedUrlSlug = normalizeUrlSlug(slug);
  const title = capitalize(parsedUrlSlug);
  const trainingId = Number(slug.split('-').pop());

  if (!Number.isFinite(trainingId) || trainingId < 1) {
    return (
      <div className="p-4">
        <p>Rutina no válida.</p>
        <Link
          href="/training"
          className="text-white hover:text-zinc-200 underline mt-2 inline-block"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  const training = getTrainingByIdForUser(trainingId, Number(result.user.id));

  if (!training) {
    return (
      <div className="p-4">
        <p>No se encontró la rutina.</p>
        <Link
          href="/training"
          className="text-white hover:text-zinc-200 underline mt-2 inline-block"
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6 flex items-center">
        <Link
          href="/training"
          className="text-white hover:text-zinc-200 text-sm font-medium shrink-0 underline-offset-2 hover:underline"
        >
          ← Volver
        </Link>
        <h1 className="text-lg w-full text-center sm:text-xl font-semibold text-right text-red-400">
          {training.training_title || title}
        </h1>
      </div>

      <div id="training-routine-card">
        <RepeatedRoutine key={training.training_id} training={training} />
      </div>
    </div>
  );
}

export default TrainingRutinePage;
