import { formatDuration, getTrainingHref } from './helpers';

describe('formatDuration', () => {
  it('formats seconds as m:ss', () => {
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(5)).toBe('0:05');
  });
});

describe('getTrainingHref', () => {
  it('generates slug and href for the routine detail', () => {
    expect(getTrainingHref(42, 'Light Spar')).toBe('/training/light-spar-42');
  });
});
