import {
  KEEP_SCREEN_ON_STORAGE_KEY,
  readKeepScreenOnPreference,
  writeKeepScreenOnPreference,
} from './keepScreenOnPreference';

describe('keepScreenOnPreference', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('defaults to true when nothing is stored', () => {
    expect(readKeepScreenOnPreference()).toBe(true);
  });

  it('reads and writes the stored preference', () => {
    writeKeepScreenOnPreference(false);
    expect(localStorage.getItem(KEEP_SCREEN_ON_STORAGE_KEY)).toBe('false');
    expect(readKeepScreenOnPreference()).toBe(false);

    writeKeepScreenOnPreference(true);
    expect(readKeepScreenOnPreference()).toBe(true);
  });
});
