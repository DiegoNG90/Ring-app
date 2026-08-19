'use client';

import { useEffect, useState } from 'react';

function readIsLandscape(): boolean {
  if (typeof window === 'undefined') return false;

  if (typeof window.matchMedia === 'function') {
    return window.matchMedia('(orientation: landscape)').matches;
  }

  return window.innerWidth > window.innerHeight;
}

export function useViewportOrientation(): boolean {
  const [isLandscape, setIsLandscape] = useState(false);

  useEffect(() => {
    const update = () => setIsLandscape(readIsLandscape());
    update();

    const mediaQuery =
      typeof window.matchMedia === 'function'
        ? window.matchMedia('(orientation: landscape)')
        : null;
    const onMediaChange = () => update();

    if (mediaQuery) {
      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', onMediaChange);
      } else {
        mediaQuery.addListener(onMediaChange);
      }
    }

    window.addEventListener('resize', update);

    return () => {
      if (mediaQuery) {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', onMediaChange);
        } else {
          mediaQuery.removeListener(onMediaChange);
        }
      }

      window.removeEventListener('resize', update);
    };
  }, []);

  return isLandscape;
}
