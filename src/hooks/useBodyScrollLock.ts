'use client';

import { useEffect } from 'react';

export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === 'undefined') return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.body.dataset.trainingExpanded = 'true';

    return () => {
      document.body.style.overflow = previousOverflow;
      delete document.body.dataset.trainingExpanded;
    };
  }, [locked]);
}
