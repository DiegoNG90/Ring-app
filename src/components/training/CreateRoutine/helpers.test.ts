import {
  buildCreateRoutinePayload,
  getStepsForType,
} from '@/components/training/CreateRoutine/helpers';
import { mapPayloadToRoundConfig } from '@/lib/routines/routine-types';

describe('CreateRoutine helpers', () => {
  it('returns the expected steps for HIIT', () => {
    expect(getStepsForType('HIIT')).toEqual([
      'name',
      'type',
      'segmentDuration',
      'restDuration',
      'rounds',
      'confirm',
    ]);
  });

  it('returns the expected steps for sparring', () => {
    expect(getStepsForType('SPARRING_2')).toEqual([
      'name',
      'type',
      'rounds',
      'confirm',
    ]);
  });

  it('maps HIIT extended interval_seconds to rest duration', () => {
    const payload = buildCreateRoutinePayload({
      name: 'Extendida',
      trainingType: 'HIIT_EXTENDED',
      segmentDuration: 80,
      restDuration: 20,
      rounds: 4,
    });

    expect(payload).not.toBeNull();
    expect(mapPayloadToRoundConfig(payload!)).toEqual({
      round_number: 4,
      duration_seconds: 80,
      rest_seconds: 20,
      repetitions: 1,
      interval_seconds: 20,
    });
  });

  it('uses fixed sparring defaults', () => {
    const payload = buildCreateRoutinePayload({
      name: 'Principiante',
      trainingType: 'SPARRING_2',
      segmentDuration: null,
      restDuration: null,
      rounds: 3,
    });

    expect(payload).not.toBeNull();
    expect(mapPayloadToRoundConfig(payload!)).toEqual({
      round_number: 3,
      duration_seconds: 120,
      rest_seconds: 60,
      repetitions: 1,
      interval_seconds: 0,
    });
  });
});
