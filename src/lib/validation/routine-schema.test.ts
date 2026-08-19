import {
  createRoutineSchema,
  normalizeRoutineName,
  ROUTINE_NAME_ERRORS,
  validateRoutineNameField,
} from '@/lib/validation/routine-schema';

describe('routine-schema', () => {
  describe('normalizeRoutineName', () => {
    it('trims and collapses spaces', () => {
      expect(normalizeRoutineName('  Mi   rutina  ')).toBe('Mi rutina');
    });

    it('removes invisible characters', () => {
      expect(normalizeRoutineName('Mi\u200Brutina')).toBe('Mirutina');
    });
  });

  describe('validateRoutineNameField', () => {
    it('accepts valid names with hyphen and colon', () => {
      expect(validateRoutineNameField('Rutina-1: mañana')).toBeNull();
    });

    it('rejects empty names', () => {
      expect(validateRoutineNameField('   ')).toBe(ROUTINE_NAME_ERRORS.required);
    });

    it('rejects names shorter than 3 characters', () => {
      expect(validateRoutineNameField('ab')).toBe(ROUTINE_NAME_ERRORS.min);
    });

    it('rejects names longer than 80 characters', () => {
      expect(validateRoutineNameField('a'.repeat(81))).toBe(
        ROUTINE_NAME_ERRORS.max,
      );
    });

    it('rejects double spaces', () => {
      expect(validateRoutineNameField('Mi  rutina')).toBe(
        ROUTINE_NAME_ERRORS.doubleSpace,
      );
    });

    it('rejects special characters', () => {
      expect(validateRoutineNameField('Rutina@home')).toBe(
        ROUTINE_NAME_ERRORS.invalidChars,
      );
    });
  });

  describe('createRoutineSchema', () => {
    it('validates HIIT payload with allowed values only', () => {
      const result = createRoutineSchema.safeParse({
        name: 'Rutina HIIT',
        trainingType: 'HIIT',
        segmentDuration: 30,
        restDuration: 10,
        rounds: 4,
      });

      expect(result.success).toBe(true);
    });

    it('rejects tampered HIIT values', () => {
      const result = createRoutineSchema.safeParse({
        name: 'Rutina HIIT',
        trainingType: 'HIIT',
        segmentDuration: 999,
        restDuration: 10,
        rounds: 4,
      });

      expect(result.success).toBe(false);
    });

    it('validates sparring payload', () => {
      const result = createRoutineSchema.safeParse({
        name: 'Sparring avanzado',
        trainingType: 'SPARRING_3',
        rounds: 3,
      });

      expect(result.success).toBe(true);
    });
  });
});
