'use client';

import { useState } from 'react';

import { CreateRoutineModal } from '@/components/training/CreateRoutine/CreateRoutineModal';
import { Button } from '@/components/ui/button';
import {
  MAX_USER_CREATED_ROUTINES,
  ROUTINE_LIMIT_REACHED_MESSAGE,
  hasAvailableRoutineSlot,
  getRemainingRoutineSlots,
} from '@/lib/routines/routine-limits';

interface CreateRoutineButtonProps {
  userCreatedCount?: number;
}

export function CreateRoutineButton({
  userCreatedCount = 0,
}: CreateRoutineButtonProps) {
  const [open, setOpen] = useState(false);

  const canCreate = hasAvailableRoutineSlot(userCreatedCount);
  const remaining = getRemainingRoutineSlots(userCreatedCount);

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        className="text-white align-center bg-teal-500 hover:bg-teal-300 hover:text-white cursor-pointer disabled:cursor-not-allowed"
        onClick={() => setOpen(true)}
        disabled={!canCreate}
        title={canCreate ? undefined : ROUTINE_LIMIT_REACHED_MESSAGE}
      >
        Nueva rutina
      </Button>

      <p className="text-xs text-zinc-400" role="status">
        {canCreate
          ? `Te quedan ${remaining} de ${MAX_USER_CREATED_ROUTINES} rutinas propias`
          : ROUTINE_LIMIT_REACHED_MESSAGE}
      </p>

      <CreateRoutineModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
