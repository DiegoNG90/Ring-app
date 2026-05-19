import React from 'react';
import Link from 'next/link';
import InfoCard from '@/components/training/Cards/InfoCard';

import { Training } from '../../../types/Trainings';
import { replaceBlankSpaceForHypen } from '@/lib/utils/strings';

interface TrainingRoutinesListProps {
  trainings: Training[];
}

function TrainingRoutinesList({ trainings }: TrainingRoutinesListProps) {
  console.log('trainings routine list:>', trainings);
  return (
    <>
      {trainings?.length > 0 ? (
        <h2 className="text-2xl font-bold text-left text-white mb-4 ml-4 mt-6">
          Listado de rutinas
        </h2>
      ) : (
        <span>Todavia no hay rutinas, crea una!</span>
      )}
      <ul>
        {trainings?.map((training: Training) => {
          return (
            <li
              className="flex justify-center items-center mb-3"
              key={training.training_id}
            >
              <InfoCard
                result={training}
                lastUsed="2024-01-15"
                timesUsed={12}
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default TrainingRoutinesList;
