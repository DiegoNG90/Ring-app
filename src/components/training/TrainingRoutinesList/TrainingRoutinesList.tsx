import React from 'react';
import Link from 'next/link';
import { Training } from '../../../types/Trainings';
import { replaceBlankSpaceForHypen } from '@/lib/utils/strings';

interface TrainingRoutinesListProps {
  trainings: Training[];
}

function TrainingRoutinesList({ trainings }: TrainingRoutinesListProps) {
  return (
    <>
      {trainings?.length > 0 ? (
        <h2>Listado de rutinas</h2>
      ) : (
        <span>Todavia no hay rutinas, crea una!</span>
      )}
      <ul>
        {trainings?.map(
          ({
            training_id,
            training_title,
          }: {
            training_id: number;
            training_title: string;
          }) => {
            const parsedTrainingTitle =
              replaceBlankSpaceForHypen(training_title);

            return (
              <li key={training_id}>
                <Link
                  href={`/training/${parsedTrainingTitle + '-' + training_id}`}
                >
                  {training_title}
                </Link>
              </li>
            );
          }
        )}
      </ul>
    </>
  );
}

export default TrainingRoutinesList;
