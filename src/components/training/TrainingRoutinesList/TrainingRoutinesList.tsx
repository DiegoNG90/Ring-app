import TrainingRoutinesEmptyState from './components/TrainingRoutinesEmptyState/TrainingRoutinesEmptyState';
import TrainingRoutinesListHeader from './components/TrainingRoutinesListHeader/TrainingRoutinesListHeader';
import TrainingRoutinesListItem from './components/TrainingRoutinesListItem/TrainingRoutinesListItem';
import type { TrainingRoutinesListProps } from './interfaces';

export default function TrainingRoutinesList({
  trainings,
}: TrainingRoutinesListProps) {
  const hasTrainings = trainings.length > 0;

  return (
    <>
      {hasTrainings ? (
        <TrainingRoutinesListHeader />
      ) : (
        <TrainingRoutinesEmptyState />
      )}

      <ul>
        {trainings.map((training) => (
          <TrainingRoutinesListItem
            key={training.training_id}
            training={training}
          />
        ))}
      </ul>
    </>
  );
}

export type { TrainingRoutinesListProps } from './interfaces';
