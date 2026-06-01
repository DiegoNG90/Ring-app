import { buildRoutineSegments, formatTime, getSegmentStepLabel } from './helpers';

describe('buildRoutineSegments', () => {
  it('returns empty array when there are no rounds', () => {
    expect(buildRoutineSegments(0, 30)).toEqual([]);
  });

  it('returns only rounds when rest is zero', () => {
    expect(buildRoutineSegments(3, 0)).toEqual([
      { type: 'round', round: 1 },
      { type: 'round', round: 2 },
      { type: 'round', round: 3 },
    ]);
  });

  it('inserts rest between rounds but not after the last one', () => {
    expect(buildRoutineSegments(2, 30)).toEqual([
      { type: 'round', round: 1 },
      { type: 'rest', round: 1 },
      { type: 'round', round: 2 },
    ]);
  });

  it('builds full sequence for multiple rounds with rest', () => {
    expect(buildRoutineSegments(3, 15)).toEqual([
      { type: 'round', round: 1 },
      { type: 'rest', round: 1 },
      { type: 'round', round: 2 },
      { type: 'rest', round: 2 },
      { type: 'round', round: 3 },
    ]);
  });
});

describe('getSegmentStepLabel', () => {
  it('returns round label for round segments', () => {
    expect(getSegmentStepLabel({ type: 'round', round: 2 })).toEqual({
      text: 'Round 2',
      colorClass: 'text-emerald-400',
    });
  });

  it('returns rest label for rest segments', () => {
    expect(getSegmentStepLabel({ type: 'rest', round: 1 })).toEqual({
      text: 'Descanso',
      colorClass: 'text-orange-400',
    });
  });

  it('returns Ciclo N for round segments when cycleNumber is set (HIIT)', () => {
    expect(getSegmentStepLabel({ type: 'round', round: 1 }, 3)).toEqual({
      text: 'Ciclo 3',
      colorClass: 'text-emerald-400',
    });
  });

  it('returns Descanso for rest segments even when cycleNumber is set', () => {
    expect(getSegmentStepLabel({ type: 'rest', round: 2 }, 3)).toEqual({
      text: 'Descanso',
      colorClass: 'text-orange-400',
    });
  });

  it('returns Round N when cycleNumber is omitted', () => {
    expect(getSegmentStepLabel({ type: 'round', round: 2 })).toEqual({
      text: 'Round 2',
      colorClass: 'text-emerald-400',
    });
  });
});

describe('formatTime', () => {
  it('formats seconds as m:ss', () => {
    expect(formatTime(125)).toBe('2:05');
    expect(formatTime(5)).toBe('0:05');
    expect(formatTime(0)).toBe('0:00');
  });
});
