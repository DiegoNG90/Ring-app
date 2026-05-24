interface TrainingRoutinesEmptyStateProps {
  message?: string;
}

export default function TrainingRoutinesEmptyState({
  message = 'Todavia no hay rutinas, crea una!',
}: TrainingRoutinesEmptyStateProps) {
  return (
    <h2 className="w-full text-center text-white block text-xl">{message}</h2>
  );
}
