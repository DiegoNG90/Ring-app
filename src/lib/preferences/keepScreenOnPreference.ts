export const KEEP_SCREEN_ON_STORAGE_KEY = 'ring-training:keep-screen-on';

export function readKeepScreenOnPreference(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const value = localStorage.getItem(KEEP_SCREEN_ON_STORAGE_KEY);
    if (value === 'false') return false;
    if (value === 'true') return true;
  } catch {
    // localStorage unavailable (private mode, etc.)
  }

  return true;
}

export function writeKeepScreenOnPreference(keepScreenOn: boolean): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(KEEP_SCREEN_ON_STORAGE_KEY, String(keepScreenOn));
  } catch {
    // Ignore write failures.
  }
}
