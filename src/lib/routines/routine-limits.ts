/**
 * Rutinas que el usuario puede crear por su cuenta. Las que vienen del seed
 * quedan marcadas con is_user_created = 0 y no consumen lugar.
 */
export const MAX_USER_CREATED_ROUTINES = 5;

export const ROUTINE_LIMIT_REACHED_MESSAGE = `Alcanzaste el máximo de ${MAX_USER_CREATED_ROUTINES} rutinas creadas por vos. Eliminá una para liberar un lugar.`;

export function hasAvailableRoutineSlot(userCreatedCount: number): boolean {
  return userCreatedCount < MAX_USER_CREATED_ROUTINES;
}

export function getRemainingRoutineSlots(userCreatedCount: number): number {
  return Math.max(0, MAX_USER_CREATED_ROUTINES - userCreatedCount);
}
