import {
  getTrainingHref,
  slugifyTrainingTitle,
} from '@/lib/utils/strings';

describe('strings slug helpers', () => {
  it('slugifies titles with colon and spaces', () => {
    expect(slugifyTrainingTitle('Rutina: mañana')).toBe('rutina-mañana');
  });

  it('builds training href with sanitized slug and id', () => {
    expect(getTrainingHref(12, 'Rutina: mañana')).toBe('/training/rutina-mañana-12');
  });
});
