export const ROUTINE_TYPES = [
  'HIIT',
  'HIIT_EXTENDED',
  'SPARRING_2',
  'SPARRING_3',
] as const;

export type RoutineType = (typeof ROUTINE_TYPES)[number];

export interface RoutineTypeDefinition {
  value: RoutineType;
  label: string;
  description: string;
  segmentDurationOptions?: readonly number[];
  segmentDurationDefault?: number;
  restDurationOptions?: readonly number[];
  restDurationDefault?: number;
  roundsOptions: readonly number[];
  roundsDefault: number;
  fixedSegmentDuration?: number;
  fixedRestDuration?: number;
}

export const ROUTINE_TYPE_DEFINITIONS: Record<
  RoutineType,
  RoutineTypeDefinition
> = {
  HIIT: {
    value: 'HIIT',
    label: 'HIIT',
    description:
      'Rutina corta de alto impacto con intervalos cortos de descanso',
    segmentDurationOptions: [25, 30, 40, 60],
    segmentDurationDefault: 30,
    restDurationOptions: [10, 15, 20],
    restDurationDefault: 10,
    roundsOptions: [3, 4, 5, 6],
    roundsDefault: 4,
  },
  HIIT_EXTENDED: {
    value: 'HIIT_EXTENDED',
    label: 'HIIT Extendido',
    description:
      'Rutina media de alto impacto con un intervalo de descanso un poco más largo que la rutina HIIT básica',
    segmentDurationOptions: [60, 80, 100, 120],
    segmentDurationDefault: 80,
    restDurationOptions: [15, 20, 30],
    restDurationDefault: 20,
    roundsOptions: [3, 4, 5, 6],
    roundsDefault: 4,
  },
  SPARRING_2: {
    value: 'SPARRING_2',
    label: "Sparring de 2'",
    description: 'Rutina para subirse al ring cuando sos principiante.',
    fixedSegmentDuration: 120,
    fixedRestDuration: 60,
    roundsOptions: [2, 3, 4, 5, 6],
    roundsDefault: 3,
  },
  SPARRING_3: {
    value: 'SPARRING_3',
    label: "Sparring de 3'",
    description: 'Rutina para subirse al ring cuando sos avanzado.',
    fixedSegmentDuration: 180,
    fixedRestDuration: 60,
    roundsOptions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
    roundsDefault: 3,
  },
};

export interface RoutineRoundConfig {
  round_number: number;
  duration_seconds: number;
  rest_seconds: number;
  repetitions: number;
  interval_seconds: number;
}

export interface CreateRoutinePayload {
  name: string;
  trainingType: RoutineType;
  segmentDuration?: number;
  restDuration?: number;
  rounds: number;
}

export function getRoutineTypeDefinition(
  type: RoutineType,
): RoutineTypeDefinition {
  return ROUTINE_TYPE_DEFINITIONS[type];
}

export function mapPayloadToRoundConfig(
  payload: CreateRoutinePayload,
): RoutineRoundConfig {
  const definition = getRoutineTypeDefinition(payload.trainingType);

  if (payload.trainingType === 'HIIT' || payload.trainingType === 'HIIT_EXTENDED') {
    const segmentDuration =
      payload.segmentDuration ?? definition.segmentDurationDefault ?? 0;
    const restDuration =
      payload.restDuration ?? definition.restDurationDefault ?? 0;

    return {
      round_number: payload.rounds,
      duration_seconds: segmentDuration,
      rest_seconds: restDuration,
      repetitions: 1,
      interval_seconds:
        payload.trainingType === 'HIIT_EXTENDED' ? restDuration : 0,
    };
  }

  return {
    round_number: payload.rounds,
    duration_seconds: definition.fixedSegmentDuration ?? 120,
    rest_seconds: definition.fixedRestDuration ?? 60,
    repetitions: 1,
    interval_seconds: 0,
  };
}

export function roundConfigsMatch(
  a: RoutineRoundConfig,
  b: RoutineRoundConfig,
): boolean {
  return (
    a.round_number === b.round_number &&
    a.duration_seconds === b.duration_seconds &&
    a.rest_seconds === b.rest_seconds &&
    a.repetitions === b.repetitions &&
    a.interval_seconds === b.interval_seconds
  );
}

export function formatDurationLabel(seconds: number): string {
  return `${seconds}"`;
}

export function formatRoundLabel(rounds: number): string {
  return String(rounds);
}
