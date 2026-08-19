'use client';

import { useCallback, useEffect, useState } from 'react';
import { useViewportOrientation } from './useViewportOrientation';

export interface UseLandscapeExpandedOptions {
  hasStarted: boolean;
  disabled?: boolean;
  isFinished?: boolean;
}

export interface UseLandscapeExpandedResult {
  isExpanded: boolean;
  isLandscape: boolean;
  dismiss: () => void;
}

export function useLandscapeExpanded({
  hasStarted,
  disabled = false,
  isFinished = false,
}: UseLandscapeExpandedOptions): UseLandscapeExpandedResult {
  const isLandscape = useViewportOrientation();
  const [dismissedWhileLandscape, setDismissedWhileLandscape] = useState(false);

  useEffect(() => {
    if (!isLandscape) {
      setDismissedWhileLandscape(false);
    }
  }, [isLandscape]);

  const dismiss = useCallback(() => {
    setDismissedWhileLandscape(true);
  }, []);

  const isExpanded =
    isLandscape &&
    hasStarted &&
    !disabled &&
    !isFinished &&
    !dismissedWhileLandscape;

  return { isExpanded, isLandscape, dismiss };
}
