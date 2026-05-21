import { Calendar, RotateCcw } from 'lucide-react';

interface InfoCardUsageMetaProps {
  timesUsed: number;
  lastUsed: string;
}

export default function InfoCardUsageMeta({
  timesUsed,
  lastUsed,
}: InfoCardUsageMetaProps) {
  return (
    <div className="pt-2 border-t border-zinc-700/60">
      <div className="flex justify-between items-center text-xs text-zinc-400">
        <div className="flex items-center gap-1">
          <RotateCcw className="h-3 w-3" aria-hidden />
          <span>Usado {timesUsed} veces</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" aria-hidden />
          <span>{new Date(lastUsed).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}
