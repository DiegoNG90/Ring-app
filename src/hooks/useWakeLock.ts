'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseWakeLockOptions {
  enabled: boolean;
}

export interface UseWakeLockResult {
  isSupported: boolean;
  isActive: boolean;
}

export function useWakeLock({ enabled }: UseWakeLockOptions): UseWakeLockResult {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const [isActive, setIsActive] = useState(false);

  const isSupported =
    typeof navigator !== 'undefined' && 'wakeLock' in navigator;

  const release = useCallback(async () => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    sentinelRef.current = null;
    setIsActive(false);

    try {
      await sentinel.release();
    } catch {
      // Already released or unavailable.
    }
  }, []);

  const acquire = useCallback(async () => {
    if (
      !isSupported ||
      document.visibilityState !== 'visible' ||
      sentinelRef.current
    ) {
      return;
    }

    try {
      const sentinel = await navigator.wakeLock.request('screen');
      sentinelRef.current = sentinel;
      setIsActive(true);

      sentinel.addEventListener('release', () => {
        if (sentinelRef.current === sentinel) {
          sentinelRef.current = null;
          setIsActive(false);
        }
      });
    } catch {
      setIsActive(false);
    }
  }, [isSupported]);

  useEffect(() => {
    if (enabled) {
      void acquire();
    } else {
      void release();
    }

    return () => {
      void release();
    };
  }, [enabled, acquire, release]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sentinelRef.current = null;
        setIsActive(false);
        return;
      }

      if (enabledRef.current) {
        void acquire();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [acquire]);

  return { isSupported, isActive };
}
