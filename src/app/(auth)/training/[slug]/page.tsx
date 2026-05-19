import React from 'react';
import Link from 'next/link';

import RoutineCard from '@/components/training/RoutineCard';
import { getTrainingById } from '@/lib/repositories/trainings';
import { capitalize, normalizeUrlSlug } from '@/lib/utils/strings';

interface TrainingRutinePageProps {
  params: Promise<{ slug: string }>;
}

async function TrainingRutinePage({ params }: TrainingRutinePageProps) {
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

  const training = getTrainingById(trainingId);

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
      <div className="mb-6 flex justify-between items-center gap-4">
        <Link
          href="/training"
          className="text-white hover:text-zinc-200 text-sm font-medium shrink-0 underline-offset-2 hover:underline"
        >
          ← Volver
        </Link>
        <h1 className="text-lg sm:text-xl font-semibold text-right text-zinc-100">
          <span className="text-zinc-400">Rutina: </span>
          <span className="text-red-400">
            {training.training_title || title}
          </span>
        </h1>
      </div>

      <div id="training-routine-card">
        <RoutineCard key={training.training_id} training={training} />
      </div>
    </div>
  );
}

export default TrainingRutinePage;
