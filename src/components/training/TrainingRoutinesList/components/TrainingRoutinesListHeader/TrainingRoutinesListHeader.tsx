interface TrainingRoutinesListHeaderProps {
  title?: string;
}

export default function TrainingRoutinesListHeader({
  title = 'Listado de rutinas',
}: TrainingRoutinesListHeaderProps) {
  return (
    <h2 className="text-2xl font-bold text-center text-white mb-4 ml-4 mt-6">
      {title}
    </h2>
  );
}
