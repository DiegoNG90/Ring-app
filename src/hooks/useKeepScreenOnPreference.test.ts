import { act, renderHook } from '@testing-library/react';
import { useKeepScreenOnPreference } from './useKeepScreenOnPreference';
import { KEEP_SCREEN_ON_STORAGE_KEY } from '@/lib/preferences/keepScreenOnPreference';

describe('useKeepScreenOnPreference', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes from localStorage', () => {
    localStorage.setItem(KEEP_SCREEN_ON_STORAGE_KEY, 'false');

    const { result } = renderHook(() => useKeepScreenOnPreference());

    expect(result.current.keepScreenOn).toBe(false);
  });

  it('persists preference updates', () => {
    const { result } = renderHook(() => useKeepScreenOnPreference());

    act(() => {
      result.current.setKeepScreenOn(false);
    });

    expect(result.current.keepScreenOn).toBe(false);
    expect(localStorage.getItem(KEEP_SCREEN_ON_STORAGE_KEY)).toBe('false');
  });
});
