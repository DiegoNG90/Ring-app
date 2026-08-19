'use client';

import { getConfirmSummary } from '@/components/training/CreateRoutine/helpers';
import type { CreateRoutinePayload } from '@/lib/routines/routine-types';

interface ConfirmStepProps {
  payload: CreateRoutinePayload;
}

export function ConfirmStep({ payload }: ConfirmStepProps) {
  const summary = getConfirmSummary(payload);

  return (
    <div className="space-y-4">
      <p className="text-sm text-zinc-400">
        Revisá los datos antes de guardar tu rutina.
      </p>
      <ul className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
        {summary.map((line) => (
          <li key={line} className="text-sm text-zinc-100">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}
