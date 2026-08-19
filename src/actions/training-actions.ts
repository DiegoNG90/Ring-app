'use server';

import { revalidatePath } from 'next/cache';

import {
  checkRoutineCreateRateLimit,
  recordRoutineCreateAttempt,
} from '@/lib/auth/rate-limit';
import { verifyAuth } from '@/lib/auth/auth';
import {
  countUserCreatedRoutines,
  createTrainingForUser,
  findTrainingByTitleAndType,
  getTrainingByIdForUser,
  isTrainingLinkedToUser,
  linkTrainingToUser,
  roundConfigsMatch,
  unlinkTrainingFromUser,
} from '@/lib/repositories/trainings';
import {
  hasAvailableRoutineSlot,
  ROUTINE_LIMIT_REACHED_MESSAGE,
} from '@/lib/routines/routine-limits';
import {
  mapPayloadToRoundConfig,
  type CreateRoutinePayload,
} from '@/lib/routines/routine-types';
import { getTrainingHref } from '@/lib/utils/strings';
import {
  createRoutineSchema,
  type CreateRoutineInput,
} from '@/lib/validation/routine-schema';

export type CreateRoutineActionResult =
  | { success: true; href: string }
  | {
      success: false;
      error?: string;
      limitReached?: boolean;
      fieldErrors?: Partial<Record<'name' | 'trainingType', string>>;
    };

export async function createRoutineAction(
  payload: unknown,
): Promise<CreateRoutineActionResult> {
  const { user } = await verifyAuth();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const rateLimit = checkRoutineCreateRateLimit(user.id);
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Demasiados intentos. Probá de nuevo más tarde.',
    };
  }

  recordRoutineCreateAttempt(user.id);

  const parsed = createRoutineSchema.safeParse(payload);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<'name' | 'trainingType', string>> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === 'name' && !fieldErrors.name) {
        fieldErrors.name = issue.message;
      }
      if (field === 'trainingType' && !fieldErrors.trainingType) {
        fieldErrors.trainingType = issue.message;
      }
    }

    return {
      success: false,
      error: 'Revisá los datos ingresados.',
      fieldErrors,
    };
  }

  const userId = Number(user.id);

  // El boton deshabilitado del cliente es solo UX: el limite real se aplica aca.
  if (!hasAvailableRoutineSlot(countUserCreatedRoutines(userId))) {
    return {
      success: false,
      limitReached: true,
      error: ROUTINE_LIMIT_REACHED_MESSAGE,
    };
  }

  const input: CreateRoutineInput = parsed.data;
  const routinePayload: CreateRoutinePayload = {
    name: input.name,
    trainingType: input.trainingType,
    rounds: input.rounds,
    ...(input.trainingType === 'HIIT' || input.trainingType === 'HIIT_EXTENDED'
      ? {
          segmentDuration: input.segmentDuration,
          restDuration: input.restDuration,
        }
      : {}),
  };

  const desiredRoundConfig = mapPayloadToRoundConfig(routinePayload);
  const existing = findTrainingByTitleAndType(
    routinePayload.name,
    routinePayload.trainingType,
  );

  let trainingId: number;

  if (existing) {
    if (isTrainingLinkedToUser(existing.training_id, userId)) {
      return {
        success: false,
        fieldErrors: {
          name: 'Ya tenés una rutina con ese nombre y tipo',
        },
      };
    }

    if (!roundConfigsMatch(existing.round_config, desiredRoundConfig)) {
      return {
        success: false,
        fieldErrors: {
          name: 'Ese nombre ya está usado para este tipo de rutina',
        },
      };
    }

    const linked = linkTrainingToUser(existing.training_id, userId, true);
    if (!linked) {
      return {
        success: false,
        error: 'No se pudo vincular la rutina existente',
      };
    }

    trainingId = existing.training_id;
  } else {
    try {
      const created = createTrainingForUser(routinePayload, userId);
      trainingId = created.trainingId;
    } catch {
      return {
        success: false,
        error: 'No se pudo crear la rutina',
      };
    }
  }

  const verified = getTrainingByIdForUser(trainingId, userId);
  if (!verified) {
    return {
      success: false,
      error: 'No se pudo crear la rutina',
    };
  }

  revalidatePath('/training');

  return {
    success: true,
    href: getTrainingHref(trainingId, verified.training_title),
  };
}

export async function deleteTrainingAction(trainingId: number) {
  const { user } = await verifyAuth();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const deleted = unlinkTrainingFromUser(trainingId, Number(user.id));

  if (!deleted) {
    return { success: false, error: 'No se pudo eliminar la rutina' };
  }

  revalidatePath('/training');
  return { success: true };
}
