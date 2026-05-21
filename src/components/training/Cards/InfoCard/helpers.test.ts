import { formatDuration, getTrainingHref } from './helpers';

describe('formatDuration', () => {
  it('formatea segundos como m:ss', () => {
    expect(formatDuration(125)).toBe('2:05');
    expect(formatDuration(60)).toBe('1:00');
    expect(formatDuration(5)).toBe('0:05');
  });
});

describe('getTrainingHref', () => {
  it('genera slug y href para el detalle de la rutina', () => {
    expect(getTrainingHref(42, 'Light Spar')).toBe('/training/light-spar-42');
  });
});
