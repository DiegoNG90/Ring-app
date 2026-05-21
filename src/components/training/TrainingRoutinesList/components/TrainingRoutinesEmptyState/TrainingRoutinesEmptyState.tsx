interface TrainingRoutinesEmptyStateProps {
  message?: string;
}

export default function TrainingRoutinesEmptyState({
  message = 'Todavia no hay rutinas, crea una!',
}: TrainingRoutinesEmptyStateProps) {
  return <span>{message}</span>;
}
