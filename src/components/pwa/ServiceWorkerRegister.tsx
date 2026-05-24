'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      !('serviceWorker' in navigator) ||
      process.env.NODE_ENV !== 'production'
    ) {
      return;
    }

    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Silent fail: PWA install prompt may not appear without SW.
    });
  }, []);

  return null;
}
