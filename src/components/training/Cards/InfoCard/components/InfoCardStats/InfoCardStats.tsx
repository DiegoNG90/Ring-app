import { formatDuration } from '../../helpers';

interface InfoCardStatsProps {
  roundNumber: number;
  durationSeconds: number;
}

export default function InfoCardStats({
  roundNumber,
  durationSeconds,
}: InfoCardStatsProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Rounds</span>
        <span className="font-medium text-zinc-100">{roundNumber}</span>
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Duración</span>
        <span className="font-medium text-zinc-100">
          {formatDuration(durationSeconds)}
        </span>
      </div>
    </div>
  );
}
