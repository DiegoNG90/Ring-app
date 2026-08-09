'use client';

import { useCallback, useState } from 'react';
import {
  readKeepScreenOnPreference,
  writeKeepScreenOnPreference,
} from '@/lib/preferences/keepScreenOnPreference';

export function useKeepScreenOnPreference() {
  const [keepScreenOn, setKeepScreenOnState] = useState(() =>
    readKeepScreenOnPreference(),
  );

  const setKeepScreenOn = useCallback((value: boolean) => {
    setKeepScreenOnState(value);
    writeKeepScreenOnPreference(value);
  }, []);

  return { keepScreenOn, setKeepScreenOn };
}
