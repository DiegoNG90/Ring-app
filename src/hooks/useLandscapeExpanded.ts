'use client';

import { useCallback, useEffect, useState } from 'react';
import { useViewportOrientation } from './useViewportOrientation';

type ExpansionPreference = 'auto' | 'expanded' | 'collapsed';

export interface UseLandscapeExpandedOptions {
  hasStarted: boolean;
  disabled?: boolean;
  isFinished?: boolean;
}

export interface UseLandscapeExpandedResult {
  isExpanded: boolean;
  isLandscape: boolean;
  expand: () => void;
  dismiss: () => void;
}

export function useLandscapeExpanded({
  hasStarted,
  disabled = false,
  isFinished = false,
}: UseLandscapeExpandedOptions): UseLandscapeExpandedResult {
  const isLandscape = useViewportOrientation();
  const [preference, setPreference] = useState<ExpansionPreference>('auto');

  useEffect(() => {
    if (!isLandscape) {
      setPreference('auto');
    }
  }, [isLandscape]);

  useEffect(() => {
    if (!hasStarted) {
      setPreference('auto');
    }
  }, [hasStarted]);

  const expand = useCallback(() => {
    setPreference('expanded');
  }, []);

  const dismiss = useCallback(() => {
    setPreference('collapsed');
  }, []);

  const canExpand = hasStarted && !disabled && !isFinished;

  const isExpanded =
    canExpand &&
    (preference === 'expanded' || (preference === 'auto' && isLandscape));

  return { isExpanded, isLandscape, expand, dismiss };
}
