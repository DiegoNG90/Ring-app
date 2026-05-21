import InfoCard from '@/components/training/Cards/InfoCard';
import type { TrainingRoutinesListItemProps } from '../../interfaces';

export default function TrainingRoutinesListItem({
  training,
  lastUsed = '2024-01-15',
  timesUsed = 12,
}: TrainingRoutinesListItemProps) {
  return (
    <li className="flex justify-center items-center mb-3">
      <InfoCard
        result={training}
        lastUsed={lastUsed}
        timesUsed={timesUsed}
      />
    </li>
  );
}
