import React from 'react';

interface TrainingRutinePageProps {
  params: { slug: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function TrainingRutinePage({ params }: TrainingRutinePageProps) {
  const { slug } = await params;

  const parsedSlug = slug.replace('-', ' ');
  const firstLetterCapitalized = parsedSlug.charAt(0).toUpperCase();
  const restOfString = parsedSlug.slice(1);

  const title = firstLetterCapitalized + restOfString;

  return (
    <div>
      <h1>Rutina {title} de entrenamiento</h1>
    </div>
  );
}

export default TrainingRutinePage;
