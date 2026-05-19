'use server';

import { revalidatePath } from 'next/cache';
import { verifyAuth } from '@/lib/auth/auth';
import { deleteTrainingById } from '@/lib/repositories/trainings';

export async function deleteTrainingAction(trainingId: number) {
  const { user } = await verifyAuth();

  if (!user) {
    return { success: false, error: 'No autorizado' };
  }

  const deleted = deleteTrainingById(trainingId, Number(user.id));

  if (!deleted) {
    return { success: false, error: 'No se pudo eliminar la rutina' };
  }

  revalidatePath('/training');
  return { success: true };
}
