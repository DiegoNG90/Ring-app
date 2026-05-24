interface TrainingRoutinesListHeaderProps {
  title?: string;
}

export default function TrainingRoutinesListHeader({
  title = 'Listado de rutinas',
}: TrainingRoutinesListHeaderProps) {
  return <h1 className="text-2xl font-bold text-center mb-4 mt-4">{title}</h1>;
}
