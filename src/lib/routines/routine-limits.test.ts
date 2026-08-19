import {
  getRemainingRoutineSlots,
  hasAvailableRoutineSlot,
  MAX_USER_CREATED_ROUTINES,
} from './routine-limits';

describe('routine limits', () => {
  it('allows creating while under the maximum', () => {
    expect(hasAvailableRoutineSlot(0)).toBe(true);
    expect(hasAvailableRoutineSlot(MAX_USER_CREATED_ROUTINES - 1)).toBe(true);
  });

  it('blocks creating once the maximum is reached', () => {
    expect(hasAvailableRoutineSlot(MAX_USER_CREATED_ROUTINES)).toBe(false);
    expect(hasAvailableRoutineSlot(MAX_USER_CREATED_ROUTINES + 3)).toBe(false);
  });

  it('reports the remaining slots without going negative', () => {
    expect(getRemainingRoutineSlots(0)).toBe(MAX_USER_CREATED_ROUTINES);
    expect(getRemainingRoutineSlots(2)).toBe(MAX_USER_CREATED_ROUTINES - 2);
    expect(getRemainingRoutineSlots(MAX_USER_CREATED_ROUTINES + 10)).toBe(0);
  });
});
