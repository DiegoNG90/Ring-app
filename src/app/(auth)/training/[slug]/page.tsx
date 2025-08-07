import { getTrainingById } from '@/lib/repositories/trainings';
import { capitalize, normalizeUrlSlug } from '@/lib/utils/strings';
import React from 'react';

interface TrainingRutinePageProps {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function TrainingRutinePage({ params }: TrainingRutinePageProps) {
  const { slug } = await params;

  // Falta hacer el GO_BACK a /training

  const parsedUrlSlug = normalizeUrlSlug(slug);
  const title = capitalize(parsedUrlSlug);
  const trainingId = Number(slug.split('-').pop());

  const result = getTrainingById(trainingId!);

  console.log('result :>', result);

  return (
    <div>
      <h1>
        Elegiste la rutina <span className="text-red-300">{title}</span>
      </h1>
      <div id="training-routine-card">
        {/* Deberia dar data de:
        - ROUND EN EL QUE ESTA / CANTIDAD DE ROUNDS
        - Mostrar el CounterTimmer */}
      </div>
    </div>
  );
}

export default TrainingRutinePage;
