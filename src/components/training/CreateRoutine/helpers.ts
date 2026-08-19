import {
  getRoutineTypeDefinition,
  ROUTINE_TYPE_DEFINITIONS,
  type CreateRoutinePayload,
  type RoutineType,
} from '@/lib/routines/routine-types';

/** Tiempo que se muestra el modal de exito antes de redirigir a la rutina creada. */
export const SUCCESS_REDIRECT_DELAY_MS = 1800;

export const CREATE_ROUTINE_STEPS = [
  'name',
  'type',
  'segmentDuration',
  'restDuration',
  'rounds',
  'confirm',
] as const;

export type CreateRoutineStepId = (typeof CREATE_ROUTINE_STEPS)[number];

export function getStepsForType(
  trainingType: RoutineType | null,
): CreateRoutineStepId[] {
  const base: CreateRoutineStepId[] = ['name', 'type'];

  if (!trainingType) {
    return base;
  }

  const definition = getRoutineTypeDefinition(trainingType);

  if (trainingType === 'HIIT' || trainingType === 'HIIT_EXTENDED') {
    return [...base, 'segmentDuration', 'restDuration', 'rounds', 'confirm'];
  }

  if (definition.roundsOptions.length > 0) {
    return [...base, 'rounds', 'confirm'];
  }

  return [...base, 'confirm'];
}

export function getDefaultDraftForType(trainingType: RoutineType) {
  const definition = ROUTINE_TYPE_DEFINITIONS[trainingType];

  return {
    segmentDuration: definition.segmentDurationDefault ?? null,
    restDuration: definition.restDurationDefault ?? null,
    rounds: definition.roundsDefault,
  };
}

export function buildCreateRoutinePayload(draft: {
  name: string;
  trainingType: RoutineType;
  segmentDuration: number | null;
  restDuration: number | null;
  rounds: number | null;
}): CreateRoutinePayload | null {
  if (!draft.rounds) {
    return null;
  }

  if (draft.trainingType === 'HIIT' || draft.trainingType === 'HIIT_EXTENDED') {
    if (draft.segmentDuration == null || draft.restDuration == null) {
      return null;
    }

    return {
      name: draft.name,
      trainingType: draft.trainingType,
      segmentDuration: draft.segmentDuration,
      restDuration: draft.restDuration,
      rounds: draft.rounds,
    };
  }

  return {
    name: draft.name,
    trainingType: draft.trainingType,
    rounds: draft.rounds,
  };
}

export function getStepTitle(step: CreateRoutineStepId): string {
  switch (step) {
    case 'name':
      return '¿Cuál es el nombre de la rutina?';
    case 'type':
      return '¿Cuál es el tipo de rutina?';
    case 'segmentDuration':
      return '¿Cuánto dura cada segmento?';
    case 'restDuration':
      return '¿Cuánto tiempo de descanso entre cada lapso?';
    case 'rounds':
      return '¿Cuántos rounds deseás?';
    case 'confirm':
      return 'Confirmá tu rutina';
    default:
      return '';
  }
}

export function getConfirmSummary(payload: CreateRoutinePayload): string[] {
  const definition = getRoutineTypeDefinition(payload.trainingType);
  const lines = [
    `Nombre: ${payload.name}`,
    `Tipo: ${definition.label}`,
  ];

  if (payload.trainingType === 'HIIT' || payload.trainingType === 'HIIT_EXTENDED') {
    lines.push(`Segmento: ${payload.segmentDuration}"`);
    lines.push(`Descanso: ${payload.restDuration}"`);
  }

  lines.push(`Rounds: ${payload.rounds}`);

  return lines;
}
