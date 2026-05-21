import type { Training } from '@/types/Trainings';

export interface TrainingRoutinesListProps {
  trainings: Training[];
}

export interface TrainingRoutinesListItemProps {
  training: Training;
  lastUsed?: string;
  timesUsed?: number;
}
